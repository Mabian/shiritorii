export type Language = 'de' | 'en';

export const LANGUAGES: readonly { readonly code: Language; readonly label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
];

export interface LegalSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export const IMPRINT = {
  address: [
    'Mabian - Fabian Manz',
    'c/o Online-Impressum.de #32298',
    'Europaring 90',
    '53757 Sankt Augustin',
  ],
  email: 'mabian@mein.online-impressum.de',
  secondContactUrl: 'https://mein.online-impressum.de/mabian/#zweiterkontaktweg',
  text: {
    de: {
      title: 'Impressum',
      secondContact: 'Zweiter Kontaktweg',
      note: 'Angaben gemäß § 5 DDG und § 18 Abs. 1 MStV.',
    },
    en: {
      title: 'Legal Notice',
      secondContact: 'Second contact option',
      note: 'Information pursuant to § 5 DDG and § 18 (1) MStV of German law.',
    },
  },
} as const;

const GITHUB_PRIVACY =
  'https://docs.github.com/site-policy/privacy-policies/github-privacy-statement';

export const PRIVACY: Readonly<
  Record<Language, { readonly title: string; readonly sections: readonly LegalSection[] }>
> = {
  de: {
    title: 'Datenschutzerklärung',
    sections: [
      {
        heading: 'Verantwortlicher',
        paragraphs: [
          'Verantwortlich für die Datenverarbeitung auf dieser Seite ist die im Impressum genannte Person.',
        ],
      },
      {
        heading: 'Hosting',
        paragraphs: [
          'Diese Seite wird über GitHub Pages bereitgestellt, einen Dienst der GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA.',
          'Beim Abruf der Seite erhebt GitHub technisch notwendige Zugriffsdaten in Server-Logfiles, darunter die IP-Adresse des abrufenden Geräts. Auf Umfang und Dauer dieser Verarbeitung habe ich keinen Einfluss. Rechtsgrundlage ist das berechtigte Interesse an einer sicheren und zuverlässigen Bereitstellung der Seite nach Art. 6 Abs. 1 lit. f DSGVO.',
          `Einzelheiten dazu finden sich in der Datenschutzerklärung von GitHub unter ${GITHUB_PRIVACY}.`,
        ],
      },
      {
        heading: 'Keine Cookies, keine Analyse',
        paragraphs: [
          'Diese Anwendung setzt keine Cookies, legt nichts im Speicher des Browsers ab und bindet keine Analyse-, Tracking- oder Werbedienste ein. Eingegebene Wörter und erreichte Punktzahlen verlassen den Browser nicht und werden nirgends gespeichert.',
        ],
      },
      {
        heading: 'Keine Inhalte von Dritten',
        paragraphs: [
          'Schriftarten und die Wörterbuchdaten werden von derselben Adresse ausgeliefert wie die Seite selbst. Beim Benutzen der Anwendung werden keine Inhalte von fremden Servern nachgeladen, und es entsteht keine Verbindung zu Dritten.',
          'Die Fußzeile und diese Erklärung enthalten Verweise auf fremde Seiten. Eine Verbindung dorthin entsteht erst, wenn ein solcher Verweis angeklickt wird.',
        ],
      },
      {
        heading: 'Ihre Rechte',
        paragraphs: [
          'Sie haben das Recht auf Auskunft über die zu Ihnen gespeicherten Daten sowie auf deren Berichtigung, Löschung oder Einschränkung der Verarbeitung. Wenden Sie sich dafür an die im Impressum genannte Adresse.',
          'Daneben steht Ihnen ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Controller',
        paragraphs: [
          'The person named in the legal notice is responsible for the data processing on this site.',
        ],
      },
      {
        heading: 'Hosting',
        paragraphs: [
          'This site is served through GitHub Pages, a service of GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA.',
          'When the site is requested, GitHub records technically necessary access data in server log files, including the IP address of the requesting device. I have no influence over the scope or the duration of that processing. The legal basis is the legitimate interest in providing the site securely and reliably, Art. 6(1)(f) GDPR.',
          `The details are set out in GitHub's privacy statement at ${GITHUB_PRIVACY}.`,
        ],
      },
      {
        heading: 'No cookies, no analytics',
        paragraphs: [
          'This application sets no cookies, stores nothing in the browser and embeds no analytics, tracking or advertising services. The words you type and the scores you reach never leave your browser and are not stored anywhere.',
        ],
      },
      {
        heading: 'No third-party content',
        paragraphs: [
          'The fonts and the dictionary data are served from the same address as the site itself. Playing the game loads nothing from outside servers and opens no connection to third parties.',
          'The footer and this policy link to external sites. A connection is made only once such a link is followed.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You have the right to information about the data held about you, and to its correction, deletion or the restriction of its processing. Please write to the address given in the legal notice.',
          'You also have the right to lodge a complaint with a data protection supervisory authority.',
        ],
      },
    ],
  },
};
