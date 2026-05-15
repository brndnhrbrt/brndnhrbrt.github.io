# Image Steganography

Hide secret messages inside PNG images by manipulating pixel color values. Works entirely in the browser with no server, no install, and no internet connection required.

## Usage

Open `index.html` in any modern browser.

### Encode

1. Upload a PNG image
2. Type your secret message
3. Click **Encode Message into Image**
4. Download the resulting PNG

The encoded image looks identical to the original but carries your hidden message in its pixel data.

### Decode

1. Upload a PNG that was encoded with this tool
2. Click **Decode Hidden Message**
3. The hidden message is revealed

## How it works

Each character in the message is converted to a 9-bit binary string. The bits are distributed across pixel RGB channels — one bit per channel:

- Bit `0` → channel value set to an **odd non-prime**
- Bit `1` → channel value set to an **even non-prime**
- End of message → channel values set to **prime numbers** (terminator)

Decoding reads each channel's even/odd parity until it finds a pixel where all three RGB channels are prime, signaling the end of the message.

## Limitations

- Input and output must be **PNG** (lossless). JPEG compression would corrupt the pixel-level encoding.
- Maximum message length depends on image resolution: roughly `(width × height × 3) / 9` characters.
- Supports standard ASCII characters (up to code point 511).
