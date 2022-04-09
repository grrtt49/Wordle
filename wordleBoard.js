class WordleBoard {
	selector;
	letters;
	numGuesses;
	currentGuessNum;
	currentLetterNum;
	guesses;
	letterStates;
	notInWordClass;
	wrongPlaceClass;
	correctPlaceClass;
	word;
	completed;
	
	constructor(selector, letters, numGuesses) {
		this.selector = selector;
		this.letters = letters;
		this.numGuesses = numGuesses;
		this.currentGuessNum = 0;
		this.currentLetterNum = 0;
		this.guesses = [];
		this.notInWordClass = "incorrect";
		this.wrongPlaceClass = "wrong-place";
		this.correctPlaceClass = "correct";
		this.completed = false;
		this.setGuesses();
		this.setLetterStates();
		this.word = this.getRandomWord().toUpperCase();
	}

	resetGame() {
		this.currentGuessNum = 0;
		this.currentLetterNum = 0;
		this.guesses = [];
		this.notInWordClass = "incorrect";
		this.wrongPlaceClass = "wrong-place";
		this.correctPlaceClass = "correct";
		this.completed = false;
		this.setGuesses();
		this.setLetterStates();
		this.word = this.getRandomWord().toUpperCase();
		this.drawBoard();
	}

	getRandomWord() {
		var random = Math.floor(Math.random() * wordleWords.length);
		return wordleWords[random];
	}

	typeLetter(letter) {
		if(this.currentLetterNum < this.letters && !this.completed) {
			$("#pos-" + this.currentGuessNum + "-" + this.currentLetterNum)
				.text(letter);
			this.guesses[this.currentGuessNum].push(letter);
			this.currentLetterNum++;
		}
	}

	removeLetter() {
		if(this.currentLetterNum > 0 && !this.completed) {
			this.currentLetterNum--;
			$("#pos-" + this.currentGuessNum + "-" + this.currentLetterNum)
				.text("");
			this.guesses[this.currentGuessNum].pop();
		}
	}

	makeGuess() {
		var word = this.getWord(this.currentGuessNum);
		var isAWord = allWords.includes(word.toLowerCase());
		if(this.currentLetterNum == this.letters && this.currentGuessNum < this.numGuesses && !this.completed && isAWord) {
			$("#textPrompt").html("");
			var completed = true;
			for(let i = 0; i < this.letters; i++) {
				var className = this.getClassFromMatch(word, i);
				this.setBestClass(this.guesses[this.currentGuessNum][i], className);
				$("#pos-" + this.currentGuessNum + "-" + i)
					.addClass(className);
				if(className != this.correctPlaceClass) {
					completed = false;
				}
			}
			if(completed) {
				this.setCompleted();
			}
			this.currentGuessNum++;
			this.currentLetterNum = 0;
		}
		else {
			if(this.currentLetterNum != this.letters) {
				this.setError("Not enough letters", this.currentGuessNum);
			}
			else if(!isAWord) {
				this.setError("Not a known word", this.currentGuessNum);
			}
		}
		
		if(this.currentGuessNum >= this.numGuesses) {
			this.setFailed();
		}
	}

	setError(text, line) {
		$("#textPrompt").html(text);
		$(".row-pos-" + line)
		.animate({"border-color": "red"}, 200, function() {
			$(".row-pos-" + line).animate({"border-color": "#555"}, 200);
		})
		.effect("shake", {"distance": 10});
	}

	getWord(guessNum) {
		var guess = this.guesses[guessNum];
		var word = "";
		for(let i = 0; i < guess.length; i++) {
			word += guess[i];
		}
		return word;
	}

	setFailed() {
		this.completed = true;
		$("#textPrompt").html("The word was: " + this.word + "<div class='button' onclick='board.resetGame()'>Next</div>");
	}

	setCompleted() {
		this.completed = true;
		$("#textPrompt").html("You got it correct!!!<div class='button' onclick='board.resetGame()'>Next</div>");
	}
	
	getClassFromMatch(guess, index) {
		var char = guess.charAt(index);
		if(char == this.word.charAt(index)) return this.correctPlaceClass;
		
		//Account for multiple letters
		//if not correct place and there are more occurences in the word than the guess
		var occurences = this.countOccurences(char, this.word);
		var guessOccurences = this.countOccurences(char, guess);//this.countOccurencesUntilIndex(char, guess, index);
		
		if(guessOccurences > occurences) {
			//if there are less incorrect occurences at this index than total incorrect
			var incorrectOccurences = this.countIncorrectOccurencesUntilIndex(char, guess, this.word, index);
			if(guessOccurences - occurences >= incorrectOccurences) {
				return this.notInWordClass;
			}
		}
		
		if(occurences > 0) return this.wrongPlaceClass;
		return this.notInWordClass;
	}

	countOccurences(char, str) {
		var count = 0;
		for(let i = 0; i < str.length; i++) {
			if(str.charAt(i) == char) {
				count++;
			}
		}
		return count;
	}

	countIncorrectOccurencesUntilIndex(char, str, word, index) {
		var count = 0;
		for(let i = 0; i <= index; i++) {
			if(str.charAt(i) == char && str.charAt(i) != word.charAt(i)) {
				count++;
			}
		}
		return count;
	}

	setGuesses() {
		for(let i = 0; i < this.numGuesses; i++) {
			this.guesses.push([]);
		}
	}

	setLetterStates() {
		this.letterStates = [];
		var lettersArr = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
		for(let i = 0; i < lettersArr.length; i++) {
			this.letterStates.push([]);
			for(let c = 0; c < lettersArr[i].length; c++) {
				this.letterStates[i].push({"letter": lettersArr[i].charAt(c), "bestGuessClass": ""});
			}
		}
	}

	drawBoard() {
		var boardHTML = "";
		for(let y = 0; y < this.numGuesses; y++) {
			boardHTML += "<div class='word-row'>";
			for(let x = 0; x < this.letters; x++) {
				boardHTML += "<div id='pos-"+y+"-"+x+"' class='letter-square row-pos-"+y+"'></div>";
			}
			boardHTML += "</div>";
		}
		boardHTML += "<div id='textPrompt'></div>";
		boardHTML += "<div id='keyboard'>" + this.getKeyBoard() + "</div>";
		$(this.selector).html(boardHTML);
	}

	setBestClass(letter, letterClass) {
		for(let i = 0; i < this.letterStates.length; i++) {
			for(let c = 0; c < this.letterStates[i].length; c++) {
				if(this.letterStates[i][c].letter == letter) {
					if(this.letterStates[i][c].bestGuessClass != this.correctPlaceClass) {
						this.letterStates[i][c].bestGuessClass = letterClass;
					}
				}
			}
		}
		$("#keyboard").html(this.getKeyBoard());
	}

	getKeyBoard() {
		var keyboardHTML = "";
		for(let i = 0; i < this.letterStates.length; i++) {
			keyboardHTML += "<div class='keyboard-row'>";
			if(i == this.letterStates.length - 1) {
				keyboardHTML += "<div class='keyboard-backspace' onclick='board.makeGuess()'><ion-icon name='checkmark-circle' color='white' style='font-size: 20px;'></ion-icon></div>";
			}
			for(let c = 0; c < this.letterStates[i].length; c++) {
				keyboardHTML += "<div class='keyboard-letter "+this.letterStates[i][c].bestGuessClass+"' onclick='board.typeLetter(\""+this.letterStates[i][c].letter+"\")'>" + this.letterStates[i][c].letter + "</div>";
			}
			//add backspace
			if(i == this.letterStates.length - 1) {
				keyboardHTML += "<div class='keyboard-backspace' onclick='board.removeLetter()'><ion-icon name='backspace' color='white' style='font-size: 20px;'></ion-icon></div>";
			}
			keyboardHTML += "</div>";
		}
		return keyboardHTML;
	}
}