from datetime import datetime, timedelta


class Listener:

	lastListenTime = None
	deactivateTimeInSeconds = 30
	initializerArray = []

	def __init__(self, initializerArray):
		self.initializerArray = initializerArray

	def isInitializerCalled(self, translateResponse):
		for item in translateResponse['alternative']:
			text = item['transcript']
			for potentialInitializer in self.initializerArray:
				if(text.lower().startswith(potentialInitializer)):
					return True
		return False

	def activateListener(self):
		self.lastListenTime = datetime.now()
		print("Listener activated!")

	def deactivateListener(self):
		self.lastListenTime = None
		print("Listener deactivated...")

	def listenerIsActive(self):
		if(self.lastListenTime is None):
			return False
		currentTime = datetime.now()
		difference = currentTime - self.lastListenTime
		timeDifferenceDelta = timedelta(seconds=self.deactivateTimeInSeconds)
		if(difference > timeDifferenceDelta):
			return False
		return True


	def getHighestConfidenceItemFromResponse(self, translateResponse):
		highestConfidence = None
		text = ""
		for item in translateResponse['alternative']:
			if(highestConfidence is None or item['confidence'] > highestConfidence):
				text = item['transcript']
				highestConfidence = item['confidence']
				continue
		return text

	def isStopCommandCalled(self, translateResponse):
		# implement...
		return False

	def listenToText(self, translateResponse):
		text = self.getHighestConfidenceItemFromResponse(translateResponse)
		print(f"Generating response for text: {text}")
		self.activateListener()

	def handleTextResponse(self, translateResponse):

		if(self.isStopCommandCalled(translateResponse)):
			print("Stop command called...")
			self.deactivateListener()
			return

		if(self.listenerIsActive()):
			print("Listener is active...")
			self.listenToText(translateResponse)
			return
		else:
			print("Listener not active...")

		if(self.isInitializerCalled(translateResponse)):

			print("Initializer called!")
			self.activateListener()
			return

		print("Did not find initializer in text...")

