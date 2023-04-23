import fsp from 'fs/promises';
import path from 'path';

import { bundleMDX } from 'mdx-bundler';
import { z } from 'zod';

const schemaForFrontmatter = z.object({
  titel: z.string(),
  beschreibung: z.string(),
  schulstufe: z.string(),
  modul: z.string(),
  kompetenzen: z.array(z.enum(['T', 'G', 'I'])),
});

type Frontmatter = z.infer<typeof schemaForFrontmatter>;

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

const fetchMarkdownFile = async (
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

const markdownToMdx = async (content: string) => {
  const [{ default: rehypeSlug }, { default: remarkGfm }] = await Promise.all([
    import('rehype-slug'),
    import('remark-gfm'),
  ]);

  const mdx = await bundleMDX<Frontmatter>({
    source: content,
    mdxOptions: (options) => {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm];
      options.rehypePlugins = [...(options.rehypePlugins ?? []), rehypeSlug];
      return options;
    },
  });

  return mdx;
};

import { redirect } from 'next/navigation';

import Markdown from '../components/Markdown';

type SearchParams = { [key: string]: string | string[] | undefined };

const parseSearchParams = (searchParams: SearchParams) => {
  const markdown = searchParams['markdown'];

  if (!markdown) return null;

  if (typeof markdown === 'string') return markdown;

  return markdown.at(0);
};

export const runtime = 'experimental-edge';

const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const slug = parseSearchParams(searchParams);

  if (!slug) {
    redirect('?markdown=datei-explorer');
  }

  const markdownContent = await fetchMarkdownFile(
    'frank-kolesik',
    'digi-blog',
    'main',
    `markdown/${slug}.md`
  );

  if (!markdownContent) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-8">
        <h1>Home: NO DOCUMENT FOUND</h1>
      </div>
    );
  }

  const { code, frontmatter } = await markdownToMdx(markdownContent);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 flex gap-4">
      <div className="basis-80 border-r-2 pr-4 border-gray-100 space-y-4 text-sm">
        <div>
          <span className="font-medium">Titel:</span>
          <p className="leading-none">{frontmatter.titel}</p>
        </div>

        <div>
          <span className="font-medium">Beschreibung:</span>
          <p className="leading-none">{frontmatter.beschreibung}</p>
        </div>

        <div>
          <span className="font-medium">Modul:</span>
          <p className="leading-none">{frontmatter.modul}</p>
        </div>

        <div>
          <span className="font-medium">Schulstufe:</span>
          <p className="leading-none">{frontmatter.schulstufe}</p>
        </div>
      </div>

      <div className="prose prose-blue basis-full max-w-none">
        <Markdown code={code} />
      </div>
    </div>
  );
};

export default Page;
