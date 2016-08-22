# Dragify
> Turn your plain DOM elements into drag queens


## What is it?
`dragify` will turn elements in the DOM into dragable elements.
It triggers hardware acceleration by using the css3 `transform` and `will-change`.
This should help to optimize performance when dragging elements with a lot of content on large pages.


## Demo
Will be created soon


## Features

- Easy to set up
- Uses hardware acceleration
- The possibility to provide a [**threshold**][1]
- The 'to-be-dragged' element provides visual feedback while dragging


## Install
```
npm install dragify --save
```


## Usage
```js
var dragify = new Dragify(containers,options);

```

### `Containers`
`containers` is an array of the parents of the DOM elements you wish to `dragify`.

```html

<div class="parent-one">
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
</div>

<div class="parent-two">
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
</div>
```

```js

containers = [
	document.getElementsByClassName("parent-one")[0],
	document.getElementsByClassName("parent-two")[0]
]

var dragify = new Dragify(containers);
```


### `Options`

#### `Options.threshold`
The threshold option was created to make sure a **click** on a element **doesn't turn into a drag** because the user can't keep it's mouse steady during the click.
Lots of users want to click on an element but instead drag it, even though it's just a little distance.
This threshold option allows you to determine how much a user is allowed to move **before** the actual drag starts.
As long as the drag doesn't start all events the element is listening for will still be triggered as if the drag attempt has not happened yet.
By default a threshold of `3px` is applied in both directions.

```js
options = {
	threshold: {
		x: 20
		y: 20
	}
}

var dragify = new Dragify(containers, options);
```
*The user can now mousedown on an element and move the mouse 20px left right up and down from it's original starting point before the actual drag will start.*

#### `Options.transition`
While dragging an element that element will be in transition. It's opacity will drop to `0.3`. When de element is dropped the element's opacity will become `1.0` again.
By default this change in opacity will have a transition. However on `drop` the className `dragify--transition` (which enables this transition) will still be shown on the element due to the time it
takes for the transition to finish. If you do not want this class to be added you can disable the transition class by setting this value to `false`.
By default the transition is set to `true`.

```js
options = {
	transition: false
}

var dragify = new Dragify(containers, options);
```
*Of course you can still add the transition properties to the element directly.*


### Events
You can listen to the following events

```js
var dragify = new Dragify(containers);

dragify.on('drag', function(){console.log('drag');});
dragify.on('move', function(){console.log('move');});
dragify.on('drop', function(){console.log('drop');});
dragify.on('cancel', function(){console.log('cancel');});
dragify.on('end', function(){console.log('end');});
```

Event Name | Listener Arguments             | Event Description
-----------|--------------------------------|-------------------
`drag`     | `el, source`                   | `el` was lifted from `source`
`move`     | `el, parent, source, replaced` | `el` changed position and now has parent `parent` and originally came from `source`. If defined `replaced` was replaced by `el`.
`drop`     | `el, parent, source`           | `el` was dropped into `parent`, and originally came from `source`
`cancel`   | `el, source`                   | `el` was dragged but ended up at it's original position in the original `source`
`end`      | `el`                           | Dragging event for `el` ended with either `cancel` or `drop`


## Planned functionality
- Support IE
- Support mobile
- Support removing


## Inspiration
I have used [Dragula][2] and liked its simplicity but I wanted hardware acceleration and a threshold.
The lack of these functionalities in dragula causes some discomfort for my own use cases.
If required I will try to add more of the functionality that Dragula provides, however I do not focus on supporting < IE10.
PR's for supporting < IE10 however I will take into consideration.


[1]: #optionsthreshold
[2]: https://github.com/bevacqua/dragula/
