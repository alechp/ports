import React from 'react';
import { Box, Text } from 'ink';

export const HelpModal: React.FC = () => {
  return (
    <Box
      flexDirection="column"
      paddingX={2}
      paddingY={1}
      borderStyle="double"
      borderColor="yellow"
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="yellow">Keyboard Shortcuts</Text>
      </Box>

      {/* Main List View Section */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">Main List View:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Text><Text color="green">↑/k</Text>           Move selection up</Text>
          <Text><Text color="green">↓/j</Text>           Move selection down</Text>
          <Text><Text color="green">gg</Text>            Go to top</Text>
          <Text><Text color="green">G</Text>             Go to bottom</Text>
          <Text><Text color="green">Ctrl+D</Text>        Page down (10 items)</Text>
          <Text><Text color="green">Ctrl+U</Text>        Page up (10 items)</Text>
          <Text><Text color="green">l</Text>             Expand selected project</Text>
          <Text><Text color="green">h</Text>             Collapse selected project</Text>
          <Text><Text color="green">Ctrl+L</Text>        Expand (works in search mode)</Text>
          <Text><Text color="green">Ctrl+H</Text>        Collapse (works in search mode)</Text>
          <Text><Text color="green">Ctrl+N</Text>        Move down (works in search mode)</Text>
          <Text><Text color="green">Ctrl+P</Text>        Move up (works in search mode)</Text>
          <Text><Text color="green">Enter</Text>         Focus on selected project</Text>
          <Text><Text color="green">Space</Text>         Toggle expand/collapse</Text>
          <Text><Text color="green">/</Text>             Open search box</Text>
          <Text><Text color="green">p</Text>             Manage scan paths</Text>
          <Text><Text color="green">x</Text>             Collapse all projects</Text>
          <Text><Text color="green">X</Text>             Expand all projects</Text>
          <Text><Text color="green">Esc</Text>           Cancel search</Text>
          <Text><Text color="green">q/Ctrl+C</Text>      Quit application</Text>
        </Box>
      </Box>

      {/* Focused Card View Section */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="magenta">Focused Card View:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Text><Text color="green">↑/k</Text>           Scroll up through current section</Text>
          <Text><Text color="green">↓/j</Text>           Scroll down through current section</Text>
          <Text><Text color="green">gg</Text>            Go to top of current section</Text>
          <Text><Text color="green">G</Text>             Go to bottom of current section</Text>
          <Text><Text color="green">Ctrl+D</Text>        Page down (10 items)</Text>
          <Text><Text color="green">Ctrl+U</Text>        Page up (10 items)</Text>
          <Text><Text color="green">Ctrl+N</Text>        Switch to next section (Ports → URLs)</Text>
          <Text><Text color="green">Ctrl+P</Text>        Switch to previous section (URLs → Ports)</Text>
          <Text><Text color="green">y</Text>             Yank (copy) port/URL to clipboard</Text>
          <Text><Text color="green">Enter</Text>         Open port/URL in browser</Text>
          <Text><Text color="green">Esc</Text>           Return to main list</Text>
          <Text><Text color="green">/</Text>             Open search</Text>
        </Box>
      </Box>

      {/* Footer */}
      <Box justifyContent="center" borderTop borderColor="gray" paddingTop={1}>
        <Text color="gray">Press ? to close this help</Text>
      </Box>
    </Box>
  );
};
