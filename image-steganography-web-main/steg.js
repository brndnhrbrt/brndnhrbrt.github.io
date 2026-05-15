// ── Algorithm helpers ─────────────────────────────────────────────────────────

function primeCheck(n) {
    n = Math.abs(Math.floor(n));
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let x = 3; x <= Math.sqrt(n); x += 2) {
        if (n % x === 0) return false;
    }
    return true;
}

function findNearestPrime(n) {
    let m = n;
    while (m < 255) { if (primeCheck(m)) return m; m++; }
    m = n;
    while (m > 0)   { if (primeCheck(m)) return m; m--; }
    return 83;
}

// Descends from n to 0, then ascends from 0 to 254.
// odd=true  → odd non-prime (compare=0, need m%2 != 0)
// odd=false → even non-prime (compare=1, need m%2 != 1)
function findNonPrime(odd, n) {
    const compare = odd ? 0 : 1;
    let m = n;
    while (m > 0) {
        if (m % 2 !== compare && !primeCheck(m)) return m;
        m--;
    }
    while (m < 255) {
        if (m % 2 !== compare && !primeCheck(m)) return m;
        m++;
    }
    return odd ? 9 : 4;
}

// ── Precomputed lookup tables (0–255) ─────────────────────────────────────────
// Built once at load time; replaces all runtime primality calls during encode/decode.

const IS_PRIME       = new Uint8Array(256);
const ODD_NON_PRIME  = new Uint8Array(256);
const EVEN_NON_PRIME = new Uint8Array(256);
const NEAREST_PRIME  = new Uint8Array(256);

(function buildTables() {
    for (let i = 0; i < 256; i++) {
        IS_PRIME[i]       = primeCheck(i) ? 1 : 0;
        ODD_NON_PRIME[i]  = findNonPrime(true,  i);
        EVEN_NON_PRIME[i] = findNonPrime(false, i);
        NEAREST_PRIME[i]  = findNearestPrime(i);
    }
})();

// ── Bit string utilities ──────────────────────────────────────────────────────

const MAX_BITS = 9; // bits per character in legacy text mode

// Convert text to binary string (9 bits per char, MSB first)
function stringToBin(str) {
    const parts = [];
    for (const c of str) parts.push(c.charCodeAt(0).toString(2).padStart(MAX_BITS, '0'));
    return parts.join('');
}

// Convert binary string to text (9 bits per char)
function binToString(bin) {
    const chars = [];
    for (let i = 0; i + MAX_BITS <= bin.length; i += MAX_BITS) {
        let val = 0;
        for (let j = 0; j < MAX_BITS; j++) {
            if (bin[i + j] === '1') val |= (1 << (MAX_BITS - 1 - j));
        }
        chars.push(String.fromCharCode(val));
    }
    return chars.join('');
}

// Convert Uint8Array to binary string (8 bits per byte, MSB first)
function byteArrayToBin(bytes) {
    const parts = [];
    for (let i = 0; i < bytes.length; i++) {
        parts.push(bytes[i].toString(2).padStart(8, '0'));
    }
    return parts.join('');
}

// Convert binary string to Uint8Array (8 bits per byte)
function binToBytes(bin) {
    const len = Math.floor(bin.length / 8);
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        let val = 0;
        for (let j = 0; j < 8; j++) {
            if (bin[i * 8 + j] === '1') val |= (1 << (7 - j));
        }
        bytes[i] = val;
    }
    return bytes;
}

// Split binary string into groups of 3 (one group per pixel)
function chunkBin(bin) {
    const arr = [];
    for (let i = 0; i < bin.length; i += 3) {
        arr.push([...bin.slice(i, Math.min(i + 3, bin.length))]);
    }
    return arr;
}

function allPrime(r, g, b) {
    return IS_PRIME[r] && IS_PRIME[g] && IS_PRIME[b];
}

// ── Core encode / decode ──────────────────────────────────────────────────────

// Encodes a pre-built binary string into imageData in-place.
// Returns { error } or { success: true }.
function encodeImageDataBits(imageData, bin) {
    const { data, width, height } = imageData;
    const maxBits = (width * height * 3) - 1;

    if (bin.length >= maxBits) {
        return { error: `Image too small. Payload needs ${bin.length} bits; image holds ${maxBits}.` };
    }

    const chunks = chunkBin(bin);
    const last = chunks.length - 1;

    if (chunks[last].length < 3) {
        while (chunks[last].length < 3) chunks[last].push('2');
    } else {
        chunks.push(['2', '2', '2']);
    }

    for (let i = 0; i < chunks.length; i++) {
        const cx = i % width;
        const cy = Math.floor(i / width);
        const pi = (cy * width + cx) * 4;

        for (let j = 0; j < chunks[i].length; j++) {
            const bit = chunks[i][j];
            const val = data[pi + j];
            let newVal;

            if (bit === '1') {
                if (val === 255)         { newVal = 254; }
                else if (val % 2 !== 0) { newVal = EVEN_NON_PRIME[val + 1]; }
                else                    { newVal = EVEN_NON_PRIME[val]; }
            } else if (bit === '2') {
                newVal = NEAREST_PRIME[val];
            } else {
                newVal = (val === 255) ? 255 : ODD_NON_PRIME[val];
            }

            data[pi + j] = newVal;
        }
    }

    return { success: true };
}

// Convenience wrapper for text encoding (legacy interface).
function encodeImageData(imageData, message) {
    return encodeImageDataBits(imageData, stringToBin(message));
}

// Returns a binary string (bits of encoded data) if a terminator pixel is found,
// or null if the image was not encoded with this tool.
function decodeImageData(imageData) {
    const { data, width, height } = imageData;
    const bits = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pi = (y * width + x) * 4;
            const r = data[pi], g = data[pi + 1], b = data[pi + 2];

            if (allPrime(r, g, b)) return bits.join('');

            bits.push(r % 2 === 0 ? '1' : '0');
            bits.push(g % 2 === 0 ? '1' : '0');
            bits.push(b % 2 === 0 ? '1' : '0');
        }
    }

    return null;
}

// ── Binary payload helpers ────────────────────────────────────────────────────

// Binary header format (all encoded as 8-bit groups):
//   Bytes 0–3:     Magic 'STEG' = [83, 84, 69, 71]
//   Bytes 4–(4+N): File extension, null-terminated ASCII, max 16 chars (e.g. "png\0")
//   Next 4 bytes:  Payload length as big-endian uint32
//   Remaining:     Raw file bytes

async function buildBinaryPayload(file) {
    const ext = (file.name.includes('.')
        ? file.name.slice(file.name.lastIndexOf('.') + 1)
        : 'bin'
    ).toLowerCase().slice(0, 16);

    const extBytes = [...ext].map(c => c.charCodeAt(0));
    extBytes.push(0); // null terminator

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const fileLen = fileBytes.length;

    const headerSize = 4 + extBytes.length + 4;
    const payload = new Uint8Array(headerSize + fileLen);

    // Magic
    payload[0] = 83; payload[1] = 84; payload[2] = 69; payload[3] = 71;
    // Extension
    for (let i = 0; i < extBytes.length; i++) payload[4 + i] = extBytes[i];
    // Length (big-endian uint32)
    const lo = 4 + extBytes.length;
    payload[lo]     = (fileLen >>> 24) & 0xFF;
    payload[lo + 1] = (fileLen >>> 16) & 0xFF;
    payload[lo + 2] = (fileLen >>> 8)  & 0xFF;
    payload[lo + 3] =  fileLen         & 0xFF;
    // File data
    payload.set(fileBytes, headerSize);

    return payload;
}

// Returns { extension, data: Uint8Array } if the bit string contains a binary payload,
// or null if the magic is absent (caller should fall back to text decoding).
function parseBinaryPayload(bin) {
    if (bin.length < 32) return null;

    // Inline magic check on raw bit string — avoids allocating full Uint8Array on miss
    const magic = [83, 84, 69, 71];
    for (let b = 0; b < 4; b++) {
        let val = 0;
        for (let j = 0; j < 8; j++) {
            if (bin[b * 8 + j] === '1') val |= (1 << (7 - j));
        }
        if (val !== magic[b]) return null;
    }

    const bytes = binToBytes(bin);

    // Read null-terminated extension
    let extEnd = 4;
    while (extEnd < bytes.length && bytes[extEnd] !== 0) extEnd++;
    if (extEnd >= bytes.length) return null;

    const extension = String.fromCharCode(...bytes.slice(4, extEnd));
    const lo = extEnd + 1;
    if (lo + 4 > bytes.length) return null;

    const fileLen = ((bytes[lo] << 24) | (bytes[lo+1] << 16) |
                     (bytes[lo+2] << 8) | bytes[lo+3]) >>> 0;
    const dataOffset = lo + 4;
    if (dataOffset + fileLen > bytes.length) return null;

    return { extension, data: bytes.slice(dataOffset, dataOffset + fileLen) };
}

// ── App state ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let encodeImg   = null;
let encodedBlob = null;
let decodeImg   = null;
let encodeMode  = 'text'; // 'text' | 'file'
let payloadFile = null;   // File selected in file mode
let decodedBinary = null; // { extension, data: Uint8Array } from last decode

// ── UI helpers ────────────────────────────────────────────────────────────────

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b, i) =>
        b.classList.toggle('active', (i === 0) === (tab === 'encode')));
    document.getElementById('encode-panel').classList.toggle('active', tab === 'encode');
    document.getElementById('decode-panel').classList.toggle('active', tab === 'decode');
}

function loadImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function setStatus(id, msg, type) {
    document.getElementById(id).innerHTML =
        msg ? `<div class="alert alert-${type}">${msg}</div>` : '';
}

function setupDropZone(dropId, inputId, statusId, onFile) {
    const zone  = document.getElementById(dropId);
    const input = document.getElementById(inputId);

    input.addEventListener('change', () => { if (input.files[0]) onFile(input.files[0]); });

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) onFile(file);
        else setStatus(statusId, 'Please drop an image file.', 'error');
    });
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Encode ────────────────────────────────────────────────────────────────────

function maxCharsForImage(img) {
    const maxBits = (img.width * img.height * 3) - 1;
    return Math.floor((maxBits - 3) / MAX_BITS);
}

function maxBytesForImage(img, headerBytes) {
    const maxBits = (img.width * img.height * 3) - 1;
    return Math.floor((maxBits - 3) / 8) - headerBytes;
}

function headerBytesForFile(file) {
    const ext = (file.name.includes('.')
        ? file.name.slice(file.name.lastIndexOf('.') + 1)
        : 'bin'
    ).toLowerCase().slice(0, 16);
    return 4 + ext.length + 1 + 4; // magic + ext + null + length field
}

function updateCounter() {
    const counter = document.getElementById('enc-counter');
    const btn     = document.getElementById('enc-btn');

    if (encodeMode === 'text') {
        const len = document.getElementById('enc-msg').value.length;
        if (!encodeImg) {
            counter.className = 'char-counter';
            counter.textContent = `${len} characters`;
            btn.disabled = true;
            return;
        }
        const max = maxCharsForImage(encodeImg);
        const pct = len / max;
        counter.textContent = `${len} / ${max} characters`;
        counter.className = 'char-counter' + (pct >= 1 ? ' over' : pct >= 0.85 ? ' warn' : '');
        btn.disabled = len === 0 || pct >= 1;
    } else {
        if (!encodeImg || !payloadFile) {
            counter.className = 'char-counter';
            counter.textContent = payloadFile ? formatBytes(payloadFile.size) : '0 B';
            btn.disabled = true;
            return;
        }
        const hdr = headerBytesForFile(payloadFile);
        const max = maxBytesForImage(encodeImg, hdr);
        const pct = payloadFile.size / max;
        counter.textContent = `${formatBytes(payloadFile.size)} / ${formatBytes(max)}`;
        counter.className = 'char-counter' + (pct >= 1 ? ' over' : pct >= 0.85 ? ' warn' : '');
        btn.disabled = pct >= 1;
    }
}

function setEncodeMode(mode) {
    encodeMode = mode;
    document.getElementById('mode-text-btn').classList.toggle('active', mode === 'text');
    document.getElementById('mode-file-btn').classList.toggle('active', mode === 'file');
    document.getElementById('enc-text-mode').classList.toggle('hidden', mode !== 'text');
    document.getElementById('enc-file-mode').classList.toggle('hidden', mode !== 'file');
    document.getElementById('enc-btn').textContent =
        mode === 'text' ? 'Encode Message into Image' : 'Encode File into Image';
    payloadFile = null;
    resetPayloadHint();
    updateCounter();
}

function resetPayloadHint() {
    document.getElementById('enc-payload-hint').innerHTML =
        '<strong>Click to select any file</strong> to hide inside the image';
}

// Carrier image drop zone (encode tab)
setupDropZone('enc-drop', 'enc-file', 'enc-status', async file => {
    try {
        encodeImg = await loadImageFile(file);
        document.getElementById('enc-img').src = encodeImg.src;
        document.getElementById('enc-meta').textContent =
            `${encodeImg.width} \u00d7 ${encodeImg.height} px`;
        document.getElementById('enc-img-wrap').classList.remove('hidden');
        document.getElementById('enc-output').classList.add('hidden');
        setStatus('enc-status', '', '');
        updateCounter();
    } catch {
        setStatus('enc-status', 'Failed to load image.', 'error');
    }
});

// Text input counter
document.getElementById('enc-msg').addEventListener('input', updateCounter);

// Payload file picker
document.getElementById('enc-payload-file').addEventListener('change', function () {
    if (this.files[0]) handlePayloadFile(this.files[0]);
});

// Payload drop zone (any file type — no image restriction)
(function setupPayloadDrop() {
    const zone = document.getElementById('enc-payload-drop');
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handlePayloadFile(file);
    });
})();

function handlePayloadFile(file) {
    payloadFile = file;
    document.getElementById('enc-payload-hint').innerHTML =
        `<strong>${file.name}</strong><br><span style="color:#475569">${formatBytes(file.size)}</span>`;
    updateCounter();
}

async function runEncode() {
    if (!encodeImg) return;

    const btn = document.getElementById('enc-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Encoding&hellip;';
    document.getElementById('enc-output').classList.add('hidden');
    setStatus('enc-status', '', '');

    await new Promise(r => setTimeout(r, 16)); // yield to render spinner

    try {
        canvas.width  = encodeImg.width;
        canvas.height = encodeImg.height;
        ctx.drawImage(encodeImg, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let result;
        if (encodeMode === 'text') {
            const message = document.getElementById('enc-msg').value;
            if (!message) { btn.disabled = false; btn.textContent = 'Encode Message into Image'; return; }
            result = encodeImageData(imgData, message);
        } else {
            if (!payloadFile) { btn.disabled = false; btn.textContent = 'Encode File into Image'; return; }
            const payload = await buildBinaryPayload(payloadFile);
            result = encodeImageDataBits(imgData, byteArrayToBin(payload));
        }

        if (result.error) {
            setStatus('enc-status', result.error, 'error');
        } else {
            ctx.putImageData(imgData, 0, 0);
            canvas.toBlob(blob => {
                encodedBlob = blob;
                const url = URL.createObjectURL(blob);
                document.getElementById('enc-out-img').src = url;
                document.getElementById('enc-output').classList.remove('hidden');
                setStatus('enc-status', 'Successfully encoded!', 'success');
            }, 'image/png');
        }
    } catch (e) {
        setStatus('enc-status', 'Encoding failed: ' + e.message, 'error');
    }

    btn.innerHTML = encodeMode === 'text' ? 'Encode Message into Image' : 'Encode File into Image';
    updateCounter();
}

function downloadEncoded() {
    if (!encodedBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(encodedBlob);
    a.download = 'encoded_image.png';
    a.click();
}

// ── Decode ────────────────────────────────────────────────────────────────────

setupDropZone('dec-drop', 'dec-file', 'dec-status', async file => {
    try {
        decodeImg = await loadImageFile(file);
        document.getElementById('dec-img').src = decodeImg.src;
        document.getElementById('dec-img-wrap').classList.remove('hidden');
        document.getElementById('dec-btn').disabled = false;
        document.getElementById('dec-output').classList.add('hidden');
        decodedBinary = null;
        setStatus('dec-status', '', '');
    } catch {
        setStatus('dec-status', 'Failed to load image.', 'error');
    }
});

async function runDecode() {
    if (!decodeImg) return;

    const btn = document.getElementById('dec-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Decoding&hellip;';
    document.getElementById('dec-output').classList.add('hidden');
    decodedBinary = null;
    setStatus('dec-status', '', '');

    await new Promise(r => setTimeout(r, 16));

    try {
        canvas.width  = decodeImg.width;
        canvas.height = decodeImg.height;
        ctx.drawImage(decodeImg, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const bin = decodeImageData(imgData);

        if (bin === null || bin === '') {
            setStatus('dec-status',
                'No hidden content found. Make sure this image was encoded with this tool.',
                'error');
        } else {
            const binary = parseBinaryPayload(bin);
            if (binary) {
                decodedBinary = binary;
                document.getElementById('dec-output-label').textContent = 'Hidden file';
                document.getElementById('dec-binary-name').textContent =
                    `decoded.${binary.extension} \u2014 ${formatBytes(binary.data.length)}`;
                document.getElementById('dec-msg').classList.add('hidden');
                document.getElementById('dec-binary-info').classList.remove('hidden');
            } else {
                const message = binToString(bin);
                document.getElementById('dec-output-label').textContent = 'Hidden message';
                document.getElementById('dec-msg').textContent = message;
                document.getElementById('dec-msg').classList.remove('hidden');
                document.getElementById('dec-binary-info').classList.add('hidden');
            }
            document.getElementById('dec-output').classList.remove('hidden');
        }
    } catch (e) {
        setStatus('dec-status', 'Decoding failed: ' + e.message, 'error');
    }

    btn.innerHTML = 'Decode Hidden Content';
    btn.disabled = false;
}

function downloadDecoded() {
    if (!decodedBinary) return;
    const blob = new Blob([decodedBinary.data]);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `decoded.${decodedBinary.extension}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
