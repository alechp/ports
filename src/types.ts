export interface PortInfo {
  port: string;
  purpose: string;
  source: string;
}

export interface ProjectInfo {
  repo: string;
  path: string;
  ports: PortInfo[];
  urls: string[];
}
