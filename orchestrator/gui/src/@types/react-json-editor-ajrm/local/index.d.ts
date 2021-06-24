// Locale/Language

interface LanguageLocale {
  format: string; // formatted as '{reason} at line {line}'
  symbols: {
    colon: string;        // :
    comma: string;        // ,  ،  、
    semicolon: string;    // ;
    slash: string;        // /  relevant for comment syntax support
    backslash: string;    // \  relevant for escaping character
    brackets: {
      round: string;      // ( )
      square: string;     // [ ]
      curly: string;      // { }
      angle: string;      // < >
    };
    period: string;       // . Also known as full point, full stop, or dot
    quotes: {
      single: string;     // '
      double: string;     // "
      grave: string;      // ` used on Javascript ES6 Syntax for String Templates
    };
    space: string;        // ` `
    ampersand: string;    //	&
    asterisk: string;     //	*  relevant for some comment sytanx
    at: string;           // @  multiple uses in other coding languages including certain data types
    equals: string;       //	=
    hash: string;         //	#
    percent: string;      //	%
    plus: string;         //	+
    minus: string;        //	−
    dash: string;         //	−
    hyphen: string;       //	−
    tilde: string;        //	~
    underscore: string;   //	_
    bar: string;          //	|
  };
  // Reference: https://en.wikipedia.org/wiki/List_of_data_structures
  types: {
    key: string;
    value: string;
    number: string;
    string: string;
    primitive: string;
    boolean: string;
    character: string;
    integer: string;
    array: string;
    float: string;
  };
  invalidToken: {
    tokenSequence: {
      prohibited: string; // formatted as "'{firstToken}' token cannot be followed by '{secondToken}' token(s)"
      permitted: string; // formatted as "'{firstToken}' token can only be followed by '{secondToken}' token(s)"
    };
    termSequence: {
      prohibited: string; // formatted as 'A {firstTerm} cannot be followed by a {secondTerm}'
      permitted: string; // formatted as 'A {firstTerm} can only be followed by a {secondTerm}'
    };
    double: string; // formatted as "'{token}' token cannot be followed by another '{token}' token"
    useInstead: string; // formatted as "'{badToken}' token is not accepted. Use '{goodToken}' instead"
    unexpected: string; // formatted as "Unexpected '{token}' token found"
  };
  brace: {
    curly: {
      missingOpen: string;
      missingClose: string;
      cannotWrap: string; // formatted as "'{token}' token cannot be wrapped in '{}' curly braces"
    };
    square: {
      missingOpen: string;
      missingClose: string;
      cannotWrap: string; // formatted as "'{token}' token cannot be wrapped in '[]' square braces"
    }
  };
  string: {
    missingOpen: string; // formatted as "Missing/invalid opening string '{quote}' token"
    missingClose: string; // formatted as "Missing/invalid closing string '{quote}' token"
    mustBeWrappedByQuotes: string;
    nonAlphanumeric: string; // formatted as "Non-alphanumeric token '{token}' is not allowed outside string notation"
    unexpectedKey: string;
  };
  key: {
    numberAndLetterMissingQuotes: string;
    spaceMissingQuotes: string;
    unexpectedString: string;
  };
  noTrailingOrLeadingComma: string;
}

declare module 'react-json-editor-ajrm/locale' {
  type Locale = LanguageLocale;
  export { Locale };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function format(str: string, args: Record<string, any>): string;
}

// Languages
declare module 'react-json-editor-ajrm/locale/de' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/en' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/es' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/fr' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/hin' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/id' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/jpm' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/pt' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/ru' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/ta' {
  const locale: LanguageLocale;
  export default locale;
}

declare module 'react-json-editor-ajrm/locale/ah-cn' {
  const locale: LanguageLocale;
  export default locale;
}
