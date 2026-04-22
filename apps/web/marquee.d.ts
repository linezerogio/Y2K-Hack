// React 19 moved JSX.IntrinsicElements under React.JSX. Add <marquee>
// so we can use it directly in TSX without dangerouslySetInnerHTML.
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          behavior?: 'scroll' | 'slide' | 'alternate';
          direction?: 'left' | 'right' | 'up' | 'down';
          scrollamount?: number | string;
        },
        HTMLElement
      >;
    }
  }
}
