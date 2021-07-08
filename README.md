# C64 Emulator?

I have actually been quite invested in this project. Everything is done minus about a third of the VIC and the CPU (which I've emulated before and don't anticipate having problems with).

The biggest problem is that all signs are pointing to JS being too slow to make an emulation like this happen. I have long suspected this but kept plugging away figuring I'd solve that problem when I came to it. However, testing the VIC has shown that it takes around half a second just to test what happens on raster line 48 (of 263), and that's without any other chips contributing to the work being done on each clock cycle.

I had already started a Rust project experimentally to do this emulation but never worked with it much. I'm going to switch development to that version and try to make it so that it'll still run in the browser via WASM. The JS code in this repo is current as of the time of this switch, and I will be porting it to Rust.
