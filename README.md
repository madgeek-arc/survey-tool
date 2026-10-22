# survey-tool

Angular module of the EOSC Observatory frontend for the **contributions area**: the dashboard where stakeholders,
coordinators and administrators manage groups, answer and review surveys, compare answer versions, receive
notification settings, accept invitations and edit their profile. It also holds the frontend's session services
(`UserService`, `AuthenticationService`, `AuthGuard`) used by the whole application.

```
Component:     survey-tool
Type:          Frontend module (Angular source, consumed as a Git submodule)
Status:        Production (embedded in observatory-ui)
Technology:    Angular 20 / TypeScript / RxJS, UIkit, ng-select; forms rendered by catalogue-ui
API:           Consumes the Observatory API (/api); exposes none
Swagger:       n/a (frontend)
Deployment:    Not independently deployable; compiled into observatory-ui (see observatory-ui/docs/deployment.md)
Documentation: /docs
```

## Role in the platform

```
observatory-ui  (host application, routing shell, public dashboards)
 ├── survey-tool            <- this repository, at src/survey-tool
 │    └── catalogue-ui      (nested submodule: dynamic forms, form builder, rich text editor)
 └── messaging-system-ui    (sibling submodule: inbox, threads, contact form)
```

survey-tool has no `package.json`, build or Dockerfile: its sources are compiled as part of
[observatory-ui](https://github.com/madgeek-arc/observatory-ui). It depends on the host for the `environment` object, a
home page component and the shared header/footer module (see [docs/architecture.md](docs/architecture.md)).

## Dependencies on other Observatory components

| Dependency | Used for |
|---|---|
| Observatory backend (`/api`) | Users, groups, surveys, answers, invitations, permissions, analytics |
| [catalogue-ui](https://github.com/madgeek-arc/catalogue-ui) (nested) | Form rendering, form builder, comments, rich text editor |
| observatory-ui (host) | `environments/environment`, `HomeComponent`, `SharedModule` (top menu and footer), build configuration |

## Prerequisites and local start

There is no stand-alone start. Clone [observatory-ui](https://github.com/madgeek-arc/observatory-ui) with submodules
and follow its README (`npm ci`, `npm start`).

## Documentation

| Document | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Dashboard structure, routes, services, boundaries |
| [docs/configuration.md](docs/configuration.md) | What the host must provide: environment keys, assets, scripts, styles |
| [docs/integration.md](docs/integration.md) | Backend endpoint groups, websocket, host and catalogue-ui contracts |
| [docs/security.md](docs/security.md) | Login flow, guards, session state, invitations |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

Licence: Apache License 2.0, see [LICENSE](LICENSE). [NOTICE](NOTICE) lists the third-party scripts kept in
`assets/js`. The npm packages used by the host application keep their own licences; the host's production build lists
them in `3rdpartylicenses.txt`.
