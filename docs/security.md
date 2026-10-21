# Security

survey-tool contains the frontend's session and role handling. All access control is enforced by the backend; the
checks below decide only what the browser shows or where it navigates.

## Authentication

- **Mechanism:** server-side session created by an OAuth2/OIDC flow on the backend. `AuthenticationService.login()` sets
  `window.location.href` to `environment.API_LOGIN`; no token or client secret is handled in the browser.
- **Discovery:** `UserService.getUserInfo()` calls `GET {API_ENDPOINT}/user/info`. `AuthGuard` lets the navigation continue
  when the user is already cached or the call returns a user; on an empty answer or an error it calls
  `AuthenticationService.tryLogin()`, which saves `window.location.pathname` in `sessionStorage.redirectUrl` and
  redirects to the login URL. After login the host calls `redirect()` to return to the stored path.
- **Refresh:** `UserService` re-reads `/user/info` every 60 minutes and clears the cached user when the call fails.
- **Logout:** clears `sessionStorage`, deletes the `AccessToken` cookie if it exists in the page's cookies, clears the cached user and
  navigates to `{API_ENDPOINT}/logout`.

## Authorisation

Groups come from `/user/info`: `stakeholders[]`, `coordinators[]`, `administrators[]` (each with `members` and `admins`
e-mails) and an `admin` flag.

| Check | Where | Rule |
|---|---|---|
| Logged in | `AuthGuard` on every dashboard, form-builder and invitation route | A user must exist; otherwise login starts |
| Role-based menu and homes | `ContributionsDashboardComponent` | Menu entries depend on the active group type; the active group is kept in `UserService` and `sessionStorage` |
| Stakeholder manager | `StakeholderManagerGuard` | User's e-mail is in the stakeholder's `admins`. **Not attached to any route at present** |
| Manager-only items | e.g. News and Stories in the stakeholder menu | Shown when the user is a manager of the stakeholder |
| Permissions on resources | `SurveyService.getPermissions` → `GET /permissions` | Backend answers per resource; used to enable actions |

Do not treat these as protection: hiding a menu item or guarding a route in the browser does not stop a direct API call.
A `403` from the backend is handled by the host interceptor.

## Session and storage

| Item | Store | Content | Lifetime |
|---|---|---|---|
| Session cookie | Browser cookie set by the backend | Opaque id | Backend-defined |
| `userInfo` | `sessionStorage` | Full `UserInfo` (name, e-mail, profile, groups, settings) | Tab; cleared on logout |
| `currentStakeholder`, `currentCoordinator`, `currentAdministrator` | `sessionStorage` | The selected group | Tab; cleared on logout |
| `redirectUrl` | `sessionStorage` | Path to return to after login | Until used |
| `AccessToken` cookie | Browser cookie | Only deleted on logout if present; the module does not create it | n/a |

`sessionStorage` is readable by any script running on the origin, so a cross-site-scripting flaw would expose it. Keep
tokens out of it (none are stored today).

## CSRF

State-changing requests rely on Angular's XSRF support provided by the host (`XSRF-TOKEN` cookie, `X-XSRF-TOKEN` header);
the backend must validate it.

## Invitations

A group manager creates an invitation from the My Group page or the stakeholder-manager editor (`POST /invitation` with the invitee's e-mail, role, group and group id). The
backend returns a token and states whether the e-mail was sent. The invitee opens `/invitation/accept/{token}`, which
requires a login and then posts the token to `/invitation/accept`. The token is an opaque secret: do not log it, and
treat the link as personal. Validity and single use are backend responsibilities.

## Input and content handling

- The profile picture is compressed in the browser (`CompressImageService`, images over 1 MB are reduced) and sent as a
  data URL; it is displayed through `safeUrl: 'resourceUrl'` as `data:image;base64,...`. Only the user's own picture is shown this way.
- Inline SVG icons (`icons.component.ts`) are bound with `safeUrl: 'html'`, which bypasses the sanitizer. Registry icons come from the
  bundled set (`shared/icons/icons.ts`), but the component's `svg` input accepts any string, so callers must only pass trusted markup, never user-provided text.
- Group-membership e-mails are sent as plain text bodies (`Content-Type: text/plain`) to the backend; validation is the backend's.
- Forms, descriptions and comments are rendered by catalogue-ui; see its [security notes](../catalogue-ui/docs/security.md).

## Secrets and logging

- No secrets, keys or tokens in this repository.
- Several components log to the browser console (for example `StakeholderMentionableUsersProvider` and the authentication
  service's login messages). Do not log user data, invitation tokens or session information.
