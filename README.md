# ViewManagerJS
Simple manager class for resizing canvas html element.

Call setup function to create a canvas, it will automatically listen and updates on resize events.
```
ViewManager.setup(
document.body, // parent element
800, // width
600, // height
ViewManager.Mode.FULL_SCREEN, // screen mode
ViewManager.Scale.KEEP_RATIO, // scale mode
'#000', // dead area color
() => { //do something } // on resize callback
);

const canvas = ViewManager.canvas;
```
