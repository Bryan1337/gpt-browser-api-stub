import speech_recognition
import pyttsx3
import logging

class Recognizer:

	recognizer = None
	listener = None

	def __init__(self, listener) -> None:

		self.recognizer = speech_recognition.Recognizer()
		self.listener = listener

	def run(self):

		while True:
			try:
				with speech_recognition.Microphone() as mic:
					print("Listening...")
					self.recognizer.adjust_for_ambient_noise(mic, duration=0.2)
					audio = self.recognizer.listen(mic)
					translateResponse = self.recognizer.recognize_google(audio, language="nl-NL", show_all=True)
					self.listener.handleTextResponse(translateResponse)
			except Exception:
				logging.exception("")
				self.recognizer = speech_recognition.Recognizer()
				continue