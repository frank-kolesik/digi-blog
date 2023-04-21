'use client';

import React from 'react';

import { z } from 'zod';

import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';
import Link from 'next/link';

// const CONCEPTS = {
//   T: 'Strukturen und Funktionen digitaler informatischer und medialer Systeme und Werkzeuge',
//   G: 'Gesellschaftliche Wechselwirkungen durch den Einsatz digitaler Technologien',
//   I: 'Interaktion in Form von Nutzung, Handlung und Subjektivierung',
// };

// const COMPETENCES = {
//   Orientierung:
//     'gesellschaftliche Aspekte von Medienwandel und Digitalisierung analysieren und reflektieren',
//   Information:
//     'mit Daten, Informationen und Informationssystemen verantwortungsvoll umgehen',
//   Kommunikation:
//     'Kommunizieren und Kooperieren unter Nutzung informatischer, medialer Systeme',
//   Produktion:
//     'Inhalte digital erstellen und veröffentlichen, Algorithmen entwerfen und Programmieren: Zerlegen von Problemen, Muster erkennen, Verallgemeinern/Abstrahieren und Algorithmen entwerfen',
//   Handeln:
//     'Angebote und Handlungsmöglichkeiten in einer von Digitalisierung geprägten Welt einschätzen und verantwortungsvoll nutzen',
// };

const schemaForSearchItems = z.array(
  z.object({
    slug: z.string(),
    label: z.string(),
    children: z.array(
      z.object({
        slug: z.string(),
        title: z.string(),
        description: z.string(),
        tags: z.array(z.enum(['T', 'G', 'I'])),
      })
    ),
  })
);

type SearchItems = z.infer<typeof schemaForSearchItems>;

const DUMMY_ITEMS: SearchItems = [
  {
    slug: '5-schulstufe',
    label: '5. Schulstufe',
    children: [
      {
        slug: 'datei-explorer',
        title: 'Datei-Explorer',
        description: 'Es geht um den Datei-Explorer.',
        tags: ['T'],
      },
    ],
  },
  {
    slug: '6-schulstufe',
    label: '6. Schulstufe',
    children: [
      {
        slug: '10-finger-system',
        title: '10-Finger-System',
        description: 'Es geht um das 10-Finger-System.',
        tags: ['T'],
      },
    ],
  },
  {
    slug: '7-schulstufe',
    label: '7. Schulstufe',
    children: [],
  },
  {
    slug: '8-schulstufe',
    label: '8. Schulstufe',
    children: [],
  },
];

const useKeyboardFocus = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.ctrlKey && event.code === 'KeyK') {
      event.preventDefault();

      inputRef.current?.focus();
    }

    if (['Escape', 'Esc'].includes(event.key)) {
      event.preventDefault();

      inputRef.current?.blur();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return inputRef;
};

const options: Fuse.IFuseOptions<SearchItems[number]['children'][number]> = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  // includeMatches: true,
  // findAllMatches: false,
  // minMatchCharLength: 2,
  // location: 0,
  threshold: 0.4,
  // distance: 100,
  // useExtendedSearch: false,
  ignoreLocation: true,
  // ignoreFieldNorm: false,
  keys: ['title', 'description'],
};

const SearchField = () => {
  const inputRef = useKeyboardFocus();

  const [searchItems, setSearchItems] = React.useState<SearchItems>([]);

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value.trim();

    const result = DUMMY_ITEMS.reduce<SearchItems>((items, item) => {
      const fuse = new Fuse(item.children, options);

      const result = fuse.search(search);

      if (result.length) {
        items.push({ ...item, children: result.map((child) => child.item) });
      }

      return items;
    }, []);

    setSearchItems([...result]);
  };

  const debouncedChangeHandler = React.useCallback(
    debounce(changeHandler, 250),
    []
  );

  React.useEffect(() => {
    return () => debouncedChangeHandler.cancel();
  }, [debouncedChangeHandler]);

  const inputIsNotEmpty = (inputRef.current?.value.trim().length ?? 0) > 0;

  return (
    <div className="relative w-full max-w-[240px]">
      <input
        ref={inputRef}
        spellCheck="false"
        autoComplete="off"
        type="search"
        id="data-search"
        className="bg-gray-100 border-gray-300 placeholder:text-gray-500 text-gray-500 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 outline-none appearance-none peer"
        placeholder="Suche Materialien..."
        onChange={debouncedChangeHandler}
        // show/hide results
        onBlur={() => {}}
        onFocus={() => {}}
      />
      <span className="absolute select-none top-1/2 -translate-y-1/2 right-1.5 h-5 rounded bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500 border items-center pointer-events-none hidden sm:flex">
        Strg + K
      </span>

      {inputIsNotEmpty && (
        <ul className="scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-300 scrollbar-track-transparent peer-focus-visible:block hidden border border-gray-200 bg-white text-gray-100 absolute top-full z-20 mt-2 overflow-auto overscroll-contain rounded-md p-2 shadow-sm max-h-[min(calc(50vh-11rem-env(safe-area-inset-bottom)),400px)] md:max-h-[min(calc(100vh-5rem-env(safe-area-inset-bottom)),400px)] inset-x-0 left-auto w-screen min-h-[100px] max-w-[min(calc(100vw-2rem),calc(100%+20rem))]">
          {searchItems.length ? (
            searchItems.map((item) => (
              <li key={item.slug} className="select-none first:mt-0 mt-6">
                <span className="block border-b text-sm text-gray-500 border-black/10 pl-2 font-medium pb-2">
                  {item.label}
                </span>

                <ul className="pt-2 text-gray-500">
                  {item.children.map((i) => (
                    <li
                      key={i.slug}
                      className="break-words rounded-md hover:bg-blue-50 group"
                    >
                      <Link
                        className="block scroll-m-12 px-2.5 py-2"
                        data-index="0"
                        href={`/p/${item.slug}/${i.slug}`}
                      >
                        <span className="group-hover:text-blue-500 font-bold">
                          {i.title}
                        </span>

                        <div className="excerpt mt-1 text-sm leading-[1.35rem] text-gray-600 dark:text-gray-400 contrast-more:dark:text-gray-50">
                          {i.description}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <span className="block select-none p-8 text-center text-sm font-medium text-gray-400">
              Keine Materialien gefunden...
            </span>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchField;
