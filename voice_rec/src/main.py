from util.listener import Listener
from util.recognizer import Recognizer

recognizer = Recognizer(Listener([
	"hey chad",
	"heet chad",
	"hey chat",
	"heet chat",
	"hey tsjaad",
	"heet tsjaad",
	"hey shad",
	"heet shad",
	"hey tchad",
	"heet tchad",
	"hey chet",
	"heet chet",
]))

recognizer.run()
