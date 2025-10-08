import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onCtrlH?: () => void;
  onCtrlL?: () => void;
  onCtrlN?: () => void;
  onCtrlP?: () => void;
  onEscape?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onCtrlH,
  onCtrlL,
  onCtrlN,
  onCtrlP,
  onEscape,
}) => {
  const [cursorPosition, setCursorPosition] = useState(value.length);

  useEffect(() => {
    setCursorPosition(value.length);
  }, [value]);

  useInput((input, key) => {
    // Handle Ctrl combinations first (highest priority)
    if (key.ctrl && input === 'n' && onCtrlN) {
      onCtrlN();
      return;
    }

    if (key.ctrl && input === 'p' && onCtrlP) {
      onCtrlP();
      return;
    }

    if (key.ctrl && input === 'l' && onCtrlL) {
      onCtrlL();
      return;
    }

    if (key.ctrl && input === 'h' && onCtrlH) {
      onCtrlH();
      return;
    }

    // Handle escape
    if (key.escape && onEscape) {
      onEscape();
      return;
    }

    // Handle backspace/delete
    if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
        onChange(newValue);
        setCursorPosition(cursorPosition - 1);
      }
      return;
    }

    // Handle arrow keys
    if (key.leftArrow) {
      setCursorPosition(Math.max(0, cursorPosition - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorPosition(Math.min(value.length, cursorPosition + 1));
      return;
    }

    // Handle regular character input - ONLY if not a control key
    if (input && !key.ctrl && !key.meta && input.length === 1) {
      const newValue = value.slice(0, cursorPosition) + input + value.slice(cursorPosition);
      onChange(newValue);
      setCursorPosition(cursorPosition + 1);
    }
  });

  // Render with cursor
  const beforeCursor = value.slice(0, cursorPosition);
  const atCursor = value[cursorPosition] || ' ';
  const afterCursor = value.slice(cursorPosition + 1);

  return (
    <Box>
      <Text>{beforeCursor}</Text>
      <Text backgroundColor="cyan" color="black">{atCursor}</Text>
      <Text>{afterCursor}</Text>
    </Box>
  );
};
