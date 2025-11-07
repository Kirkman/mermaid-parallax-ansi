ANSI mermaid parallax demo
==========================

![Animated ANSI mermaid](https://raw.githubusercontent.com/Kirkman/mermaid-parallax-ansi/master/output/WZKM-MERMAID.GIF)

This demo was released in the [Mistigris 21st anniversary artpack](http://bit.ly/mist1015). Artwork was drawn by Whazzit (Chris Brunjes), with code by Kirkman (Josh Renaud).

If you'd like to read about the creation of this demo, read my 2016 blog post ["ANSI mermaid swims in parallax
"](http://breakintochat.com/blog/2015/10/31/ansi-mermaid-swims-in-parallax/)

This demo runs in [Synchronet BBS](http://www.synchro.net) software's Javascript environment, and requires its Frame.js and Sprite.js libraries.

You can also download [the demo in ANS format](https://raw.githubusercontent.com/Kirkman/mermaid-parallax-ansi/master/output/WZKM-MERMAID.ANS).


Create animation
----------------

It is possible to generate an animated .GIF or .MP4 using this code. Here's how


### Save frames as .BIN files

There is a hidden feature in `bg-scroll-animation.js` that allows each frame of the animation to be exported to .BIN format.

Just change this line ...
```
var screenShot = false;
```
... to this ...
```
var screenShot = true;
```

... and the .BIN frames will be saved into `/screenshots`.


### Convert .BINs to .PNGs

If you have ansilove installed, you can use a command like the one below to batch-convert all the .BINs to .PNGs.

```
for f in /path/to/bins/*.bin; do ansilove -c 80 -f 80x25 -R 3 -o "/path/for/pngs/$(basename "$f" .bin).png" "$f"; done
```


### Convert to MP4

From this point, you can use various tools (Photoshop, etc) to convert the PNGs into an animated GIF.

To create a lossless MP4 container for the PNGs that preserves the fidelity of the animation's details, use the following command:
```
ffmpeg -framerate 5 -i "mermaid-%03d.png" -c:v png -pix_fmt rgb24 mermaid.mp4
```

If you have an older Mac, you may want to change the `.mp4` in that command to `.mov`. Or, you can create a lossy file like this:

```
ffmpeg -framerate 8 -i "mermaid-%03d.png" -c:v libx264 -crf 10 -pix_fmt yuv420p mermaid.mp4
```