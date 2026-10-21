# Configuration

survey-tool has no configuration files of its own and is not deployed on its own. It is compiled into the host
application, so "configuration" means **what the host must provide**. The reference host is
[observatory-ui](https://github.com/madgeek-arc/observatory-ui); its `docs/configuration.md` documents the actual values
per environment and the container variables.

## 1. Environment keys read by this module

The code imports `environment` from `../../environments/environment` relative to `src/survey-tool/app/...`, that is
`src/environments/environment.ts` of the host (file replacement applies per build configuration). Local file
`src/survey-tool/environments/environment.ts` re-exports it.

| Key | Required | Used by | Meaning |
|---|---|---|---|
| `API_ENDPOINT` | Yes | `UserService`, `AuthenticationService`, `SurveyService`, `StakeholdersService`, `PrivacyPolicyService` | Base URL of the Observatory REST API, no trailing slash (for example `/api`) |
| `API_LOGIN` | Yes | `AuthenticationService` | URL the browser is sent to for login; the backend starts the OAuth2/OIDC flow there |

The embedded catalogue-ui additionally needs the `APP_ENV` provider with `API_ENDPOINT`, `WS_ENDPOINT` and the
optional `WS_TOPICS` (see [catalogue-ui configuration](../catalogue-ui/docs/configuration.md)). The host provides it from the
same `environment` object: `{ provide: APP_ENV, useValue: environment }`.

## 2. Build wiring in the host (`angular.json`)

| Setting | Value | Purpose |
|---|---|---|
| `assets` | `src/survey-tool/assets`, `src/survey-tool/catalogue-ui/assets` | Images, themes, `assets/js/sockjs.min.js`, `assets/js/stomp.min.js`, loaders |
| `styles` | `src/survey-tool/styles/styles.less` (before the host's own styles) | Imports the ng-select default theme, catalogue-ui's theme and the survey-tool theme |
| `stylePreprocessorOptions.includePaths` | `src/styles`, `src/survey-tool/styles`, `node_modules/uikit/src/less` | Less resolution of the imports above |
| `scripts` | UIkit and icons, `src/survey-tool/assets/js/sockjs.min.js`, `stomp.min.js` | Global `UIkit`, `SockJS` and `Stomp` |
| `inlineStyleLanguage` | `less` | Component styles are Less |

## 3. Application providers required from the host

| Provider | Why |
|---|---|
| `provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))` | XSRF header on state-changing requests |
| `APP_ENV` | catalogue-ui configuration |
| `UserService`, `MessagingSystemService` | `UserService` is provided in `AppModule` so a single instance serves guards, menus and the dashboard |
| `HTTP_INTERCEPTORS` (optional) | The host's interceptor handles `401`/`403` globally |
| Router and animations | `RouterModule.forRoot`, `BrowserAnimationsModule` |

`SurveyToolModule` itself provides `AuthenticationService`, `SurveyService` and the `MentionableUsersProvider`
implementation.

## 4. Host code the module imports

| Import | From the host |
|---|---|
| `HomeComponent` | `src/app/pages/home/home.component` (declared in `SurveyToolModule`) |
| `SharedModule` | `src/app/shared/shared.module` (top menu and footer) |
| `environment` | `src/environments/environment` |

A different host must provide equivalents at the same relative paths.

## 5. Route data flags

`DashboardSideMenuService` reads these flags from the `data` of the activated leaf route on every navigation; a flag
that is absent takes the default shown.

| Flag | Default when absent | Effect |
|---|---|---|
| `hasSidebar` | sidebar shown | `false` hides the sidebar |
| `hasHeader` | header shown | `false` hides the header and sets `--header-height` to `0px` |
| `showFooter` | footer shown | `false` hides the footer (used by the form-builder routes) |
| `hasAdminMenu` | off | `true` selects the global admin sidebar |
| `hasInternalSidebar`, `isFrontPage`, `isSmallScreen`, `hasMenuSearchBar` | off | `true` enables the respective layout variant |
| `hasQuickContact` | on | `false` hides the quick-contact element |
| `activeMenuItem` | none | Name of the menu item to highlight |

## 6. Peer packages

Angular (core, common, forms, router, animations, platform-browser), `rxjs`, `uikit`, `@ng-select/ng-select`,
`seedrandom`, plus everything catalogue-ui needs. Versions are pinned in the host's `package.json`.

## 7. Client-side state keys

`sessionStorage`: `userInfo`, `currentStakeholder`, `currentCoordinator`, `currentAdministrator`, `redirectUrl` (cleared on logout).

## Secrets

None. Do not add credentials or tokens to the `environment` object; everything in it is shipped to browsers.
