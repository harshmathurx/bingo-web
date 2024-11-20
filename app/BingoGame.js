"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { Button } from '../components/button';
import { Alert, AlertDescription } from '../components/alert';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NumberHistory = ({ numbers, getLetterForNumber }) => {
  const [startIndex, setStartIndex] = useState(0);
  const displayCount = 8;
  const hasNext = startIndex + displayCount < numbers.length;
  const hasPrev = startIndex > 0;

  const scrollNext = () => {
    if (hasNext) {
      setStartIndex(prev => prev + 1);
    }
  };

  const scrollPrev = () => {
    if (hasPrev) {
      setStartIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (numbers.length > displayCount) {
      setStartIndex(numbers.length - displayCount);
    }
  }, [numbers.length]);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={scrollPrev}
        disabled={!hasPrev}
        className="h-6 w-6 rounded-full bg-gray-800 hover:bg-gray-700 border-gray-700"
      >
        <ChevronLeft className="h-3 w-3 text-gray-300" />
      </Button>

      <div className="flex gap-1 sm:gap-1.5">
        {numbers.slice(startIndex, startIndex + displayCount).map((num, idx) => (
          <div
            key={idx}
            className={`w-7 sm:w-9 h-7 sm:h-9 flex flex-col items-center justify-center rounded border
              ${idx === displayCount - 1 && startIndex + displayCount === numbers.length
                ? 'bg-blue-900 border-blue-800 text-white font-semibold'
                : 'bg-gray-800 border-gray-700 text-gray-300'}`}
          >
            <div className="text-[9px] sm:text-[11px] text-gray-400">{getLetterForNumber(num)}</div>
            <div className="text-xs sm:text-sm">{num}</div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={scrollNext}
        disabled={!hasNext}
        className="h-6 w-6 rounded-full bg-gray-800 hover:bg-gray-700 border-gray-700"
      >
        <ChevronRight className="h-3 w-3 text-gray-300" />
      </Button>
    </div>
  );
};

const BingoGame = () => {
  const [playerCard, setPlayerCard] = useState([]);
  const [computerCard, setComputerCard] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [remainingNumbers, setRemainingNumbers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [playerMarkedNumbers, setPlayerMarkedNumbers] = useState([]);
  const [showBingoButton, setShowBingoButton] = useState(false);
  const [falseClaim, setFalseClaim] = useState(false);
  const [winningPattern, setWinningPattern] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let drawInterval;
    
    if (gameStarted && !gameOver && !isPaused) {
      drawInterval = setInterval(() => {
        if (remainingNumbers.length > 0) {
          const index = Math.floor(Math.random() * remainingNumbers.length);
          const number = remainingNumbers[index];
          
          setCalledNumbers(prev => [...prev, number]);
          setRemainingNumbers(prev => prev.filter((_, i) => i !== index));
          
          const updatedCalledNumbers = [...calledNumbers, number];
          const computerWinPattern = findWinningPattern(computerCard, updatedCalledNumbers);
          if (computerWinPattern) {
            endGame('Computer', computerWinPattern);
          }
        } else {
          endGame('Draw', 'No more numbers to call');
        }
      }, 3000);
    }
    
    return () => {
      if (drawInterval) {
        clearInterval(drawInterval);
      }
    };
  }, [gameStarted, gameOver, isPaused, remainingNumbers.length, computerCard]);

  const generateCard = () => {
    const card = [];
    const cols = ['B', 'I', 'N', 'G', 'O'];
    
    cols.forEach((letter, colIndex) => {
      const min = colIndex * 15 + 1;
      const max = min + 14;
      const colNumbers = [];
      
      while (colNumbers.length < 5) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!colNumbers.includes(num)) {
          colNumbers.push(num);
        }
      }
      
      card.push(colNumbers);
    });
    
    card[2][2] = 'FREE';
    return card;
  };

  const startGame = () => {
    setRemainingNumbers(Array.from({length: 75}, (_, i) => i + 1));
    setCalledNumbers([]);
    setPlayerCard(generateCard());
    setComputerCard(generateCard());
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setPlayerMarkedNumbers([]);
    setShowBingoButton(false);
    setFalseClaim(false);
    setWinningPattern(null);
    setIsPaused(false);
  };

  const endGame = (winningPlayer, pattern) => {
    setGameOver(true);
    setWinner(winningPlayer);
    setWinningPattern(pattern);
    setIsPaused(true);
  };

  const handleNumberClick = (num) => {
    if (num !== 'FREE' && calledNumbers.includes(num) && !playerMarkedNumbers.includes(num)) {
      const newMarkedNumbers = [...playerMarkedNumbers, num];
      setPlayerMarkedNumbers(newMarkedNumbers);
      
      const potentialBingo = findWinningPattern(playerCard, newMarkedNumbers);
      setShowBingoButton(potentialBingo !== null);
    }
  };

  const findWinningPattern = (card, markedNumbers) => {
    const isNumberMarked = (num) => {
      return num === 'FREE' || markedNumbers.includes(num);
    };

    for (let i = 0; i < 5; i++) {
      if (card[i].every(num => isNumberMarked(num))) {
        return `Row ${i + 1}`;
      }
    }
    
    for (let i = 0; i < 5; i++) {
      const col = card.map(row => row[i]);
      if (col.every(num => isNumberMarked(num))) {
        return `Column ${['B', 'I', 'N', 'G', 'O'][i]}`;
      }
    }
    
    const diagonal1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
    const diagonal2 = [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]];
    
    if (diagonal1.every(num => isNumberMarked(num))) {
      return "Diagonal (Top-left to Bottom-right)";
    }
    if (diagonal2.every(num => isNumberMarked(num))) {
      return "Diagonal (Top-right to Bottom-left)";
    }
    
    return null;
  };

  const handleBingoClaim = () => {
    const pattern = findWinningPattern(playerCard, playerMarkedNumbers);
    if (pattern) {
      endGame('Player', pattern);
    } else {
      setFalseClaim(true);
      setTimeout(() => setFalseClaim(false), 3000);
    }
  };

  const isMarked = (num, isComputerCard = false) => {
    if (num === 'FREE') return true;
    if (isComputerCard) {
      return calledNumbers.includes(num);
    }
    return playerMarkedNumbers.includes(num);
  };

  const getLetterForNumber = (num) => {
    if (num === 'FREE') return 'N';
    const index = Math.floor((num - 1) / 15);
    return ['B', 'I', 'N', 'G', 'O'][index];
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const renderCard = (card, isComputerCard = false) => (
    <div className="w-full md:w-auto p-3 flex-1">
      <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-center text-gray-200">
        {isComputerCard ? "Computer's Card" : "Your Card"}
      </h3>
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
        {['B', 'I', 'N', 'G', 'O'].map(letter => (
          <div key={letter} className="text-center font-bold text-blue-400 text-sm sm:text-base mb-1">
            {letter}
          </div>
        ))}
        {card.map((col, i) => 
          col.map((num, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => !isComputerCard && handleNumberClick(num)}
              className={`
                border rounded min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center transition-colors
                ${num === 'FREE' ? 'bg-green-600 text-white font-medium text-sm' :
                  isMarked(num, isComputerCard) ? 'bg-blue-600 text-white font-semibold text-sm sm:text-base' : 
                  !isComputerCard ? 'cursor-pointer hover:bg-gray-700 text-gray-300 border-gray-600' : 'text-gray-300 border-gray-600'}
              `}
            >
              <span className="px-1 text-sm">{num}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[90vw] md:max-w-3xl mx-auto">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <Button 
            onClick={startGame}
            className="w-20 sm:w-28 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
          >
            New Game
          </Button>
          {gameStarted && !gameOver && (
            <>
              <Button 
                onClick={togglePause}
                variant={isPaused ? "default" : "secondary"}
                className={`w-20 sm:w-28 text-xs sm:text-sm ${
                  isPaused 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              {showBingoButton && (
                <Button 
                  onClick={handleBingoClaim}
                  className="w-20 sm:w-28 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 
                            hover:to-yellow-700 text-black font-bold text-sm sm:text-base animate-pulse"
                >
                  BINGO!
                </Button>
              )}
            </>
          )}
        </div>

        {gameStarted && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              {calledNumbers.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-lg sm:text-xl font-semibold">
                    <span className="inline-block bg-blue-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                      {getLetterForNumber(calledNumbers[calledNumbers.length - 1])}-
                      {calledNumbers[calledNumbers.length - 1]}
                    </span>
                  </div>
                  
                  {calledNumbers.length > 1 && (
                    <div className="pt-1">
                      <div className="text-xs text-gray-400 mb-1">Previous Numbers</div>
                      <NumberHistory 
                        numbers={calledNumbers.slice(0, -1).reverse()} 
                        getLetterForNumber={getLetterForNumber}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center">
              {renderCard(playerCard)}
              {renderCard(computerCard, true)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoGame;
