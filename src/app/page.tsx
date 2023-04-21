import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';

import { bundleMDX } from 'mdx-bundler';
// import matter from 'gray-matter';

import Markdown from '~/components/Markdown';

const fetchFs = async (filepath: string) => {
  const localFilePath = path.resolve(__dirname, '../../../markdown/', filepath);

  const file = await fsp.readFile(localFilePath);

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

const loader = async () => {
  const markdownPath = path.join(__dirname, '../../../markdown/');

  const markdownFiles = fs.readdirSync(markdownPath);

  const markdownContent = fs.readFileSync(
    path.join(markdownPath, markdownFiles[0]),
    'utf8'
  );

  const { code, frontmatter } = await bundleMDX({
    source: markdownContent,
  });

  return { code, frontmatter };
};

const Home = async () => {
  const { code, frontmatter } = await loader();

  return (
    <div className="prose prose-blue max-w-7xl mx-auto w-full px-4 py-8">
      <Markdown code={code} />
    </div>
  );
};

export default Home;
