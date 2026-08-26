/**
 * Shared marketing content for every Pyronaut design variant.
 */

export const SITE_NAME = "Pyronaut";

export const SITE_DESCRIPTION =
  "Pyronaut is an integrated application platform for Python, built on Micronaut. Build the Python application without having to build the application platform around it.";

export const HERO = {
  eyebrow: "Integrated application platform for Python",
  title: "Build the Python application. Not the platform around it.",
  copy: "Pyronaut combines Python on GraalPy with the Micronaut application model — one platform with a consistent way to configure, build, test, validate, package, and run Python applications.",
  badges: ["Python on GraalPy", "Micronaut application model", "GraalVM native ready"],
  ctas: [
    { label: "Get started", href: "/docs/", primary: true },
    { label: "Browse guides", href: "/guides/", primary: false },
    { label: "View on GitHub", href: "https://github.com/micronaut-projects", primary: false },
  ],
};

export interface Feature {
  title: string;
  copy: string;
  icon: string;
  href: string;
}

/** Icon names map to inline SVG glyphs rendered by each design. */
export const FEATURES: Feature[] = [
  {
    title: "Micronaut model, Python code",
    copy: "Use @Controller, @Get, @Singleton, and dependency injection directly from Python source.",
    icon: "annotations",
    href: "/docs/programming-model/",
  },
  {
    title: "One application workflow",
    copy: "create → dev → test → validate-config → build. One CLI from project creation through packaging.",
    icon: "workflow",
    href: "/docs/cli/",
  },
  {
    title: "Prepare before startup",
    copy: "DI metadata, serialization, and OpenAPI are processed at build time, before application startup.",
    icon: "bolt",
    href: "/docs/source-processing/",
  },
  {
    title: "Define once, reuse",
    copy: "Use the same Python types for HTTP, validation, serialization, OpenAPI, and editor support.",
    icon: "layers",
    href: "/docs/serialization/",
  },
  {
    title: "Application testing",
    copy: "pytest integrated with Micronaut Test, an embedded server, and real test infrastructure.",
    icon: "flask",
    href: "/docs/testing/",
  },
  {
    title: "Test Resources built in",
    copy: "Start supported services for development and tests with less custom setup.",
    icon: "database",
    href: "/docs/test-resources/",
  },
  {
    title: "Validate before production",
    copy: "Validate configuration and the dependency injection graph before the service ships.",
    icon: "shield",
    href: "/docs/validation/",
  },
  {
    title: "Packaging options",
    copy: "JVM wheel, JVM container image, native executable, native container image, or a reusable Crema runtime.",
    icon: "rocket",
    href: "/docs/packaging/",
  },
];

export interface WorkflowStage {
  command: string;
  title: string;
  copy: string;
}

export const WORKFLOW: WorkflowStage[] = [
  {
    command: "pyronaut create",
    title: "Create",
    copy: "Generate a project with platform dependencies resolved.",
  },
  {
    command: "pyronaut dev",
    title: "Develop",
    copy: "Local server with automatic reload and managed Test Resources.",
  },
  {
    command: "pyronaut test",
    title: "Test",
    copy: "pytest against the real application context and infrastructure.",
  },
  {
    command: "pyronaut validate-config",
    title: "Validate",
    copy: "Check configuration and DI wiring for dev, run, test, and production.",
  },
  {
    command: "pyronaut build",
    title: "Package",
    copy: "Produce a wheel, container image, or native executable.",
  },
];

export interface CodeExample {
  id: string;
  label: string;
  filename: string;
  language: "python" | "shell" | "yaml";
  code: string;
  caption: string;
}

export const CODE_EXAMPLES: CodeExample[] = [
  {
    id: "controller",
    label: "Controller",
    filename: "rockets.py",
    language: "python",
    caption:
      "Use Micronaut annotations directly from Python for routing, dependency injection, validation, and serialization.",
    code: `from dataclasses import dataclass

from micronaut.http.annotation import Body, Controller, Get, Post
from micronaut.serde.annotation import Serdeable
from micronaut.validation import Validated
from jakarta.inject import Singleton
from jakarta.validation.constraints import NotBlank, Positive

@Serdeable
@dataclass
class Rocket:
    name: str  # @NotBlank
    thrust_kn: float  # @Positive


@Singleton
class RocketService:
    def __init__(self) -> None:
        self._fleet: list[Rocket] = []

    def launch(self, rocket: Rocket) -> Rocket:
        self._fleet.append(rocket)
        return rocket

    def fleet(self) -> list[Rocket]:
        return list(self._fleet)


@Validated
@Controller("/rockets")
class RocketController:
    def __init__(self, service: RocketService) -> None:
        self.service = service

    @Get("/")
    def list(self) -> list[Rocket]:
        return self.service.fleet()

    @Post("/")
    def launch(self, rocket: Body[Rocket]) -> Rocket:
        return self.service.launch(rocket)`,
  },
  {
    id: "test",
    label: "Test",
    filename: "test_rockets.py",
    language: "python",
    caption:
      "pytest runs against the same embedded server, DI context, and Test Resources the application uses.",
    code: `import pytest

from pyronaut.test import PyronautTest
from pyronaut.requests import HttpClient


@PyronautTest
class TestRockets:
    def test_launch(self, client: HttpClient) -> None:
        rocket = {"name": "Ariane 7", "thrust_kn": 15000}

        created = client.post("/rockets", json=rocket)
        assert created.status == 200

        fleet = client.get("/rockets").json()
        assert fleet[0]["name"] == "Ariane 7"

    def test_validation(self, client: HttpClient) -> None:
        response = client.post(
            "/rockets", json={"name": "", "thrust_kn": -1}
        )
        assert response.status == 400`,
  },
  {
    id: "workflow",
    label: "Workflow",
    filename: "terminal",
    language: "shell",
    caption:
      "One CLI coordinates creation, development, testing, validation, and production packaging.",
    code: `$ pyronaut create rocket-service
  Resolved Micronaut platform 5.x via Maven
  Created rocket-service/ with pyproject.toml

$ pyronaut dev
  Test Resources: postgres:17 ready on :5432
  Server running on http://localhost:8080 (reload on)

$ pyronaut test
  12 passed in 3.4s (JUnit XML + HTML report)

$ pyronaut validate-config --env production
  Configuration OK · DI graph OK

$ pyronaut build --native
  Native executable: build/rocket-service`,
  },
];

export const CODE_PROOFS = [
  "Dependency injection resolved from build-time metadata",
  "Wiring and configuration errors can be detected at build time",
  "Tests run with the same services the application depends on",
];

export const DEFINE_ONCE = {
  source: "Python types and annotations",
  targets: [
    "HTTP routing",
    "Validation",
    "Serialization",
    "OpenAPI & Swagger",
    "Dependency injection",
    "Editor completion",
    "Tests",
  ],
};

export const SKEPTIC = {
  question:
    "Why not assemble a stack from the Python frameworks and tools I already know?",
  intro:
    "You can. Those tools may all be excellent. The trade-off is how much integration and platform work your team wants to maintain itself:",
  answers: [
    "Pyronaut reduces the integration work between framework, server, validation, testing, and packaging.",
    "Configuration is checked automatically during dev, run, test, and native builds.",
    "The same Python types and metadata can be used across HTTP, validation, serialization, and OpenAPI.",
    "Test infrastructure is managed as part of development and testing.",
    "The same project produces wheel, container, native, and Crema artifacts.",
    "Wiring problems can be detected before the service reaches production.",
  ],
};

export const MICRONAUT_AUDIENCE = {
  kicker: "Already building on Micronaut?",
  copy: "Add Python without adding a second application platform — use Python on the Micronaut platform you already know.",
  linkLabel: "Pyronaut for Micronaut teams",
  href: "/docs/micronaut-teams/",
};

export interface DeepDive {
  title: string;
  copy: string;
  bullets: string[];
  linkLabel: string;
  href: string;
  icon: string;
}

export const DEEP_DIVES: DeepDive[] = [
  {
    title: "Process at build time",
    copy: "Pyronaut processes source and metadata at build time, before the application starts.",
    bullets: [
      "Earlier error detection",
      "Stronger IDE support and stubs",
      "Less reliance on runtime reflection",
      "Native packaging support",
    ],
    linkLabel: "How source processing works",
    href: "/docs/source-processing/",
    icon: "bolt",
  },
  {
    title: "Validate before production",
    copy: "Check configuration for dev, test, and production environments, and optionally validate the dependency injection graph before deploying.",
    bullets: [
      "validate-config per environment",
      "DI graph validation",
      "Config schemas from processing",
      "Fail in CI, not at 3 a.m.",
    ],
    linkLabel: "Production validation",
    href: "/docs/validation/",
    icon: "shield",
  },
  {
    title: "Package for production",
    copy: "From Python source through tested and validated production artifact — pick the packaging that fits the workload.",
    bullets: [
      "JVM wheel or container image",
      "GraalVM native executable",
      "Native container image",
      "Reusable Crema runtime",
    ],
    linkLabel: "Packaging options",
    href: "/docs/packaging/",
    icon: "rocket",
  },
];

export interface Persona {
  role: string;
  value: string;
}

export const PERSONAS: Persona[] = [
  {
    role: "Python developer",
    value:
      "Spend less time on repeated integration work — build with one consistent application model.",
  },
  {
    role: "Architect",
    value:
      "Give teams one consistent way to build and maintain production Python services at scale.",
  },
  {
    role: "Platform engineering",
    value:
      "One consistent way to build, validate, package, and run Python applications across teams.",
  },
  {
    role: "Engineering leadership",
    value:
      "Reduce duplicated platform engineering and the number of application patterns teams need to support.",
  },
];

export const STACK_COMPARISON = {
  conventional: {
    title: "A representative Python stack",
    items: [
      "FastAPI + Uvicorn",
      "Pydantic + Pydantic Settings",
      "pytest + Testcontainers + fixtures",
      "structlog + OpenAPI setup",
      "Dockerfiles + CI templates",
      "…and every integration between them",
    ],
  },
  pyronaut: {
    title: "Adopt one platform",
    items: [
      "Micronaut HTTP on Netty",
      "Validation + serialization built in",
      "pytest + Micronaut Test + Test Resources",
      "Unified config and logging",
      "Wheel, container, and native builds",
      "…designed to work together",
    ],
  },
};

export const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Documentation", href: "/docs/" },
      { label: "Guides", href: "/guides/" },
      { label: "CLI reference", href: "/docs/cli/" },
      { label: "GraalPy compatibility", href: "/docs/compatibility/" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/micronaut-projects" },
      { label: "Discussions", href: "https://github.com/micronaut-projects/micronaut-core/discussions" },
      { label: "Blog", href: "/blog/" },
      { label: "Success stories", href: "/stories/" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Micronaut Framework", href: "https://micronaut.io" },
      { label: "GraalVM", href: "https://www.graalvm.org" },
      { label: "GraalPy", href: "https://www.graalvm.org/python/" },
    ],
  },
];
