Error = require "./error"



class Handler

	constructor: (@dragify) ->

		@load()
		@setup()
		@listeners()


	load: ->

		# Start the error handler
		@error = (new Error dragify: @dragify).error


	setup: ->

		# Set the name of possibly logged events
		@dragify.settings.name = "Dragify"

		# Define the containers storage
		@dragify.containers = [] if not @dragify.containers

		# Containers must be an array
		return @error 1.1 if @dragify.containers.constructor isnt Array

		# isContainer must be a function
		return @error 1.2 if not typeof @dragify.options.isContainer is "function"

		# Set the data storage var
		@setData()

		# Create mirror container
		@create()


	setData: ->

		# Store and reset data of the to-be-draged object
		@data =
			index     : null
			start     : {}
			offset    : {}
			source    : null
			parent    : null
			treshhold : {}

		# Store previously found target and valid targets
		@previous = {}


	listeners: ->

		# Listen for a mouseup in the window which stops the drag
		window.addEventListener "mouseup", @mouseup

		# Listen for a mousedown in the window which start checking if the target is a valid dragify target
		window.addEventListener "mousedown", @mousedown


	mouseup: (e) =>

		# Only listen for left mouseup
		return if e.button isnt 0

		# Stop listening for the mousemove since we stopped dragging
		window.removeEventListener "mousemove", @mousemove

		# Reset the mirror back to its basics
		@reset() if @active


	mousedown: (ev) =>

		# Only continue if left mouseclick or currently nothing is being dragged
		return if ev.button isnt 0 or @active

		# Do not allow dragify to drag and drop on inputs or textarea's
		return if ev.target.tagName is "INPUT" or ev.target.tagName is "TEXTAREA" or ev.target.tagName is "LABEL"

		# Check if this target is a valid node or has a valid node in its ancestry
		return if not @node = @validMousedown ev.target

		# Store the source where the node came from
		@data.source = @node.parentNode

		# Store the current index of the node
		@data.index = @getIndex @node

		# Store mousedown position
		@data.start.x = ev.clientX
		@data.start.y = ev.clientY

		# Store offset of the click in the element
		x = ev.offsetX
		y = ev.offsetY

		# Predefine found so it is available outside the check scope
		found = false

		# Correct for mousedown on a child (or its children) of the @node
		check = (target) =>

			# Stop checking if the target is found
			return if target is @node

			# Add to the offset so the position relative to the dragified element gets calculated
			x += target.offsetLeft
			y += target.offsetTop

			# Only check parent again if the parent exists
			return check target.parentNode if target.parentNode

			# No parent is found
			true

		# The node must always be found otherwise something is wrong with the path or the assumtion the node will always be avaiable in the path upto the window
		return @error 2.1 if check ev.target

		# Store the mousedown position within the node
		@data.offset =
			x : x
			y : y

		# Start listening for the mousemove event
		window.addEventListener "mousemove", @mousemove


	validMousedown: (target) ->

		check = (el) =>

			try
				@validContainer el
			catch e
				false

		validate = (node) ->

			# Check if the parent of this node is a valid dragify container
			return node if check node.parentNode

			# Try to validate the parent of this node since the current node was not valid
			return validate node.parentNode if node.parentNode

			# No valid parent is found
			false

		# Check if the parent node is valid
		validate target


	validContainer: (el) ->

		# Null or document are not valid containers to drop into
		return false if not el or el is document

		@dragify.containers.indexOf(el) isnt -1 or @dragify.options.isContainer el


	getIndex: (node) ->

		(return index if child is node) for child, index in node.parentNode.childNodes

		null


	mousemove: (@e) =>

		# Prevent any default actions while dragging (text-selection, cursor change)
		@e.preventDefault()

		# Store the X and Y position within the event
		@e.X = @e.clientX
		@e.Y = @e.clientY

		# If dragging has not started yet check if it needs to start
		if not @active

			# Check if the threshold has been passed
			@active = true if Math.abs(@e.X-@data.start.x) > @dragify.options.threshold.x
			@active = true if Math.abs(@e.Y-@data.start.y) > @dragify.options.threshold.y

			# Don"t so anything if the threshold has not been passed yet
			return if not @active

			# Place the mirror in the DOM
			@set()

		# Set the mirrors position
		@position() if @active


	position: ->

		# Update mirror position using transform
		@mirror.style.transform = "translate(#{@e.X-@data.offset.x}px,#{@e.Y-@data.offset.y}px)"

		# Get node behind the cursor
		target = document.elementFromPoint @e.X, @e.Y

		# Do not do anything if the target is the same as the previous target or is undefined (outside viewport the target is null)
		return if target and target is @previous.target

		# Store the new node
		@previous.target = target

		# Check if new target is valid and make sure it returns the to-be-dragged target and not one of its children or the parent container itself
		return if not target = @validParent target

		# Stop if the valid target is the same as the previous valid target
		return if target is @previous.valid

		# Act as if the original node does not exist
		return if @node is target

		# Store the new node
		@previous.valid = target

		# Switch because a new valid target has been found
		@switch target


	validParent: (target) ->

		# Target must be defined (no dragging outside the viewport)
		return if not target

		# By default assume it is not valid
		valid = false

		# Check if this target is a valid dragify parent
		valid = target if @validContainer target

		# Find-correct-parent loop function
		find = (el) =>

			# Check if the parent of this node is a valid dragify parent
			if @validContainer el.parentNode

				# Store the valid element
				valid = el

			else

				# Check if the parent of this element is valid; only if the parent exists
				find el.parentNode if el.parentNode

		# Start the find loop if no valid target has been foud yet
		find target if not valid

		# Return a valid element or false
		valid


	switch: (@target) ->

		# Target is a parent
		if @validContainer @target

			# Transfer to a new parent if the parent of the node is different from the target
			@transfer() if @node.parentNode isnt @target

			# Do not do anything if the parent of the node is targeted
			return

		# Check if the target or node has a higher index but first also check if the node is already within this parent
		if @target.parentNode isnt @node.parentNode or (@getIndex @node) > (@getIndex @target)

			# Insert befire the target
			@insert @target.parentNode, @node, @target
		else

			# Insert after the target
			@insert @target.parentNode, @node, @target.nextSibling


	insert: (parent, node, target) ->

		# Insert after the target
		parent.insertBefore node, target

		# Determin if placed in a parent or replaced another element
		replaced = if @target isnt parent then @target else undefined

		# The original element is being moved
		@dragify.emitIf "move", @node, @node.parentNode, @data.source, replaced



	transfer: ->

		# Store lowest y distance to child from mouse pointer
		lowest = null

		# Loop over all children
		for child, index in @target.childNodes

			# Get the lowest distance between child y-line segments and mouse cursor
			[val, lower] = @distance
				top    : child.offsetTop
				bottom : child.offsetTop + child.clientHeight

			# Set lowest if not defined or if the calculated distance is lower than the existing one
			if not lowest or val < lowest
				lowest = val
				target = child
				below = lower

		# Add to bottom of parent if the distance between the mouse and the closest child is bigger than the offset
		target = null if @target.childNodes[@target.childNodes.length-1] is target and below

		# Insert after the target
		@insert @target, @node, target


	distance: (pos) ->

		# Pointer is not below this element
		below = false

		# The offset position of the mouse in the parent element
		y = @e.offsetY

		# Set distance value
		val = Math.abs(y-pos.top)

		# Check if bottom value is lower
		val = bottom if val > bottom = Math.abs(y-pos.bottom)

		# Return value and if the cursor was lower than the div
		[val, y>pos.bottom]


	create: ->

		# Create the div containing a mirror of the node to be dragged and dropped
		@mirror = document.createElement "div"

		# Set tabindex of element so it can be focused
		@mirror.tabIndex = 0

		# Set className
		@mirror.className = "dragify--mirror"


	set: ->

		# Act as if the node is parent was the previous valid target to prevent the switch from triggering on this parent on drag start
		@previous.valid = @node.parentNode

		# Start the dragging
		@dragify.emitIf "drag", @node, @node.parentNode

		# Create a copy of the node to-be-dragged
		@mirror.appendChild clone = @node.cloneNode true

		# Explicitly set the clone is width because of a possible width 100%
		clone.style.width = "#{@node.offsetWidth}px"

		# Explicitly set the clone is height because of a possible height 100%
		clone.style.height = "#{@node.offsetHeight}px"

		# Add the mirror to the DOM
		document.body.appendChild @mirror

		# Focus the mirror so the @node is unfocused and doesn"t trigger event is anymore like hover
		@mirror.focus()

		# Prevent the document from selecting while dragging
		@addClass document.body, "dragify--body"

		# Allow for a transition in opacity
		@addClass @node, "dragify--transition" if @dragify.options.transition

		# Make the original node opague
		@addClass @node, "dragify--opaque"


	reset: ->

		# Reset active state
		@active = false

		# Empty the mirror by removing all it is children (which should usually only be one)
		@mirror.removeChild @mirror.firstChild while @mirror.firstChild

		# Remove the mirror from the DOM
		document.body.removeChild @mirror

		# Remove all extra styling (positioning) so it is reset to default
		@mirror.removeAttribute  "style"

		# Remove preventing selection while dragging
		@removeClass document.body, "dragify--body"

		# Remove node transfer style
		@removeClass @node, "dragify--opaque"

		# Maintain the "old" reference to the node
		remove = (node) =>

			# Remove the transition class with a delay so the transition is fully finished
			setTimeout(=>
				@removeClass node, "dragify--transition"
			,500)

		# Remove using the reference to the "old" node in case someone starts dragging a new node within the setTimeout time limit of 500ms
		remove @node if @dragify.options.transition

		# Check if the node didn"t actually change position
		if @data.source is @node.parentNode and @data.index is @getIndex @node

			# Node ended up at the place where it came from
			@dragify.emitIf "cancel", @node, @node.parentNode

		else

			# End of the dragging to a new position
			@dragify.emitIf "drop", @node, @node.parentNode, @data.source

		# Indicate end of a drag (which may have resulted in a drop or cancel)
		@dragify.emitIf "end", @node

		# Empty node reference
		@node = null

		# Empty previous target
		@target = null

		# Reset the data storage var
		@setData()


	addClass: (node, className) ->

		# Empty className will create an empty array value in the split
		classes = []

		# Split classes by space
		classes = node.className.split " " if node.className

		# Add class to the list
		classes.push className

		# Turn the list back to a class names string
		node.className = classes.join " "


	removeClass: (node, className) ->

		# Retrieve classes used on the body
		classes = node.className.split " "

		# Remove the dragify--body class from the list
		classes.splice classes.indexOf(className), 1

		# Check if the class should be reset or removed
		if classes.length is 0

			# Remove the class attribute to prevent an empty class attribute
			node.removeAttribute "class"

		else

			# Restore the old className
			node.className = classes.join " "



module.exports = Handler
