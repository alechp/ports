import React from 'react';
import { Box, Text } from 'ink';
import { ProjectInfo } from '../types';

interface FocusedCardViewProps {
  project: ProjectInfo;
  urlScrollIndex: number;
  portScrollIndex: number;
  focusedSection: 'ports' | 'urls';
  toastMessage: string | null;
}

export const FocusedCardView: React.FC<FocusedCardViewProps> = ({
  project,
  urlScrollIndex,
  portScrollIndex,
  focusedSection,
  toastMessage,
}) => {
  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      {/* Toast Notification */}
      {toastMessage && (
        <Box
          borderStyle="round"
          borderColor="green"
          paddingX={2}
          marginBottom={1}
        >
          <Text color="green">{toastMessage}</Text>
        </Box>
      )}

      {/* Focused Card Header */}
      <Box
        borderStyle="double"
        borderColor="green"
        paddingX={2}
        marginBottom={1}
      >
        <Text bold color="green">
          Focused: {project.repo}
        </Text>
        <Text color="gray"> - </Text>
        <Text color="gray">
          j/k scroll, y yank, Enter open, G/gg/Ctrl+D/U nav, Ctrl+N/P sections, ? help
        </Text>
      </Box>

      {/* Project Details */}
      <Box
        borderStyle="single"
        borderColor={focusedSection === 'ports' ? 'green' : 'cyan'}
        paddingX={2}
        paddingY={1}
        flexDirection="column"
        marginBottom={1}
      >
        {/* Full Path */}
        <Box marginBottom={1}>
          <Text bold color="cyan">Full Path: </Text>
          <Text color="white">{project.path}</Text>
        </Box>

        {/* Ports Section */}
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color={focusedSection === 'ports' ? 'green' : 'yellow'}>
            Ports ({project.ports.length}){focusedSection === 'ports' ? ' [FOCUSED]' : ''}:
          </Text>
          {project.ports.length === 0 ? (
            <Text color="gray" dimColor>  No ports found</Text>
          ) : (
            <Box flexDirection="column" marginLeft={2}>
              {project.ports.map((port, idx) => {
                const isSelected = focusedSection === 'ports' && idx === portScrollIndex;
                return (
                  <Box key={`port-${idx}-${port.port}-${port.source}`}>
                    <Text
                      color={isSelected ? 'black' : 'white'}
                      bold={isSelected}
                      backgroundColor={isSelected ? 'green' : undefined}
                    >
                      {isSelected ? '▶ ' : '  '}
                      Port {port.port.padEnd(6)} - {port.purpose.padEnd(20)} ({port.source})
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* URLs Section with Scrolling */}
      <Box
        borderStyle="single"
        borderColor={focusedSection === 'urls' ? 'green' : 'magenta'}
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Text bold color={focusedSection === 'urls' ? 'green' : 'magenta'}>
          URLs ({project.urls.length}){focusedSection === 'urls' ? ' [FOCUSED]' : ''}:
        </Text>
        {project.urls.length === 0 ? (
          <Text color="gray" dimColor>  No URLs found</Text>
        ) : (
          <Box flexDirection="column" marginLeft={2}>
            {project.urls.map((url, idx) => {
              const isSelected = focusedSection === 'urls' && idx === urlScrollIndex;
              return (
                <Box key={`url-${idx}-${url.slice(0, 50)}`}>
                  <Text
                    color={isSelected ? 'black' : 'blue'}
                    bold={isSelected}
                    backgroundColor={isSelected ? 'cyan' : undefined}
                  >
                    {isSelected ? '▶ ' : '  '}
                    {url}
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Navigation Info */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        marginTop={1}
      >
        <Text color="gray">
          Section: {focusedSection === 'ports' ? 'Ports' : 'URLs'}
        </Text>
        <Text color="gray"> | </Text>
        <Text color="gray">
          {focusedSection === 'ports'
            ? `Port: ${portScrollIndex + 1}/${project.ports.length}`
            : `URL: ${urlScrollIndex + 1}/${project.urls.length}`}
        </Text>
        <Text color="gray"> | </Text>
        <Text color="gray">
          y=yank, Enter=open, Esc=return
        </Text>
      </Box>
    </Box>
  );
};
