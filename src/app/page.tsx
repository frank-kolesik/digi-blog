import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';

import { bundleMDX } from 'mdx-bundler';
// import matter from 'gray-matter';

import Markdown from '~/components/Markdown';

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
