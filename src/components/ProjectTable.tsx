import React from 'react';
import { Box, Text } from 'ink';
import { ProjectInfo } from '../types';

interface ProjectTableProps {
  projects: ProjectInfo[];
  selectedIndex: number;
  expandedIndexes: Set<number>;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  selectedIndex,
  expandedIndexes,
}) => {
  if (projects.length === 0) {
    return (
      <Box paddingX={2} paddingY={1}>
        <Text color="yellow">No projects found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Table Header */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Box width={30}>
          <Text bold color="cyan">Project</Text>
        </Box>
        <Box width={10}>
          <Text bold color="yellow">Ports</Text>
        </Box>
        <Box width={10}>
          <Text bold color="magenta">URLs</Text>
        </Box>
        <Box width={50}>
          <Text bold color="gray">Path</Text>
        </Box>
      </Box>

      {/* Table Rows */}
      {projects.map((project, index) => {
        const isSelected = index === selectedIndex;
        const isExpanded = expandedIndexes.has(index);
        const borderColor = isSelected ? 'green' : 'gray';

        return (
          <Box key={project.path} flexDirection="column">
            {/* Main Row */}
            <Box
              borderStyle="single"
              borderColor={borderColor}
              paddingX={1}
            >
              <Box width={30}>
                <Text color={isSelected ? 'green' : 'cyan'} bold={isSelected}>
                  {isExpanded ? '▼' : '▶'} {project.repo.slice(0, 26)}
                </Text>
              </Box>
              <Box width={10}>
                <Text color="yellow">{project.ports.length}</Text>
              </Box>
              <Box width={10}>
                <Text color="magenta">{project.urls.length}</Text>
              </Box>
              <Box width={50}>
                <Text color="gray" dimColor>
                  {project.path.slice(0, 48)}
                </Text>
              </Box>
            </Box>

            {/* Expanded Details */}
            {isExpanded && (
              <Box
                borderStyle="single"
                borderColor="gray"
                borderTop={false}
                paddingX={2}
                paddingY={1}
                flexDirection="column"
              >
                {/* Full Path */}
                <Box marginBottom={1}>
                  <Text bold color="cyan">Full Path: </Text>
                  <Text color="white">{project.path}</Text>
                </Box>

                {/* Ports Section */}
                <Box flexDirection="column" marginBottom={1}>
                  <Text bold color="yellow">
                    Ports ({project.ports.length}):
                  </Text>
                  {project.ports.length === 0 ? (
                    <Text color="gray" dimColor>  No ports found</Text>
                  ) : (
                    <Box flexDirection="column" marginLeft={2}>
                      {project.ports.map((port, idx) => (
                        <Box key={`${port.port}-${idx}`}>
                          <Text color="green">• Port {port.port.padEnd(6)}</Text>
                          <Text color="white"> - {port.purpose.padEnd(20)}</Text>
                          <Text color="gray" dimColor> ({port.source})</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* URLs Section */}
                <Box flexDirection="column">
                  <Text bold color="magenta">
                    URLs ({project.urls.length}):
                  </Text>
                  {project.urls.length === 0 ? (
                    <Text color="gray" dimColor>  No URLs found</Text>
                  ) : (
                    <Box flexDirection="column" marginLeft={2}>
                      {project.urls.map((url, idx) => (
                        <Box key={`${url}-${idx}`}>
                          <Text color="blue">• {url}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
