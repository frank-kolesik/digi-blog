import fsp from 'fs/promises';
import path from 'path';

const fetchFs = async (filepath: string) => {
  const localFilePath = path.resolve(__dirname, '../../..', filepath);

  const file = await fsp.readFile(localFilePath, { encoding: 'utf8' });

  return file.toString();
};

const fetchRemote = async (
  owner: string,
  repo: string,
  branch: string,
  filepath: string
) => {
  const href = new URL(
    `${owner}/${repo}/${branch}/${filepath}`,
    'https://raw.githubusercontent.com/'
  ).href;

  const response = await fetch(href, {
    headers: { 'User-Agent': `docs:${owner}/${repo}` },
  });

  if (!response.ok) {
    return null;
  }

  return await response.text();
};

export const fetchMarkdownFile = async (
  owner: string,
  repo: string,
  branch: string,
  filepath: string
) => {
  let text: string | null;

  try {
    if (process.env.NODE_ENV === 'development') {
      text = await fetchFs(filepath);
    } else {
      text = await fetchRemote(owner, repo, branch, filepath);
    }
  } catch (e) {
    return null;
  }

  return text;
};
