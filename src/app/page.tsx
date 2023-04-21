import { notFound } from 'next/navigation';
import { bundleMDX } from 'mdx-bundler';

import { fetchMarkdownFile, markdownToMdx } from '~/utils/markdown';
import Markdown from '~/components/Markdown';

type SearchParams = { [key: string]: string | string[] | undefined };

const parseSearchParams = (searchParams: SearchParams) => {
  const markdown = searchParams['markdown'];

  if (!markdown) return null;

  if (typeof markdown === 'string') return markdown;

  return markdown.at(0);
};

const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const slug = parseSearchParams(searchParams);

  if (!slug) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-8">
        <h1>Home: NO SLUG GIVEN</h1>
      </div>
    );
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
    <div className="prose prose-blue max-w-7xl mx-auto w-full px-4 py-8">
      <Markdown code={code} />
    </div>
  );
};

export default Page;
