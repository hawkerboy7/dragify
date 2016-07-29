Handler = require './handler'



class Dragify

	constructor: (@containers, settings) ->

		@settings =

			# Determins how much you can move after mousedown before the actual drag will start
			threshold:
				x: settings?.threshold?.x || 2
				y: settings?.threshold?.y || 2

		# Setup events
		@events = {}

		# Create handler doing all private work
		new Handler this


	on: (event, fn) ->

		# Create events array or use the existing one
		@events[event] or= []

		# Add function listener
		@events[event].push fn

		# Return this instance for chaining
		this



module.exports = Dragify
