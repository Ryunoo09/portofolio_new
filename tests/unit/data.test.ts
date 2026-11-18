import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasSupabaseConfig: vi.fn(() => false),
  getSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  hasSupabaseConfig: mocks.hasSupabaseConfig,
  getSupabaseClient: mocks.getSupabaseClient,
}));

const {
  getProfile,
  getSocialLinks,
  getExperiences,
  getProjects,
  getProject,
  getSkills,
  getSiteSettings,
} = await import("@/data");

/** Chainable Supabase stub: every query method returns itself and awaits to `result`. */
function stubClient(result: { data: unknown; error: unknown }) {
  const proxy: unknown = new Proxy(function () {}, {
    get(_target, property) {
      if (property === "then") {
        return (resolve: (value: unknown) => void) => resolve(result);
      }
      return () => proxy;
    },
  });
  return proxy;
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mocks.hasSupabaseConfig.mockReturnValue(false);
  mocks.getSupabaseClient.mockReset();
});

describe("data fallback", () => {
  it("returns seed profile when Supabase is not configured", async () => {
    const profile = await getProfile();

    expect(profile.full_name).toBe("Rakha Yuda Wicaksono");
    expect(profile.headline).toBe("Software Engineer");
  });

  it("hides unpublished projects from the list", async () => {
    const projects = await getProjects();

    expect(projects.map((project) => project.slug)).toEqual([
      "draft-project-one",
      "draft-project-two",
      "draft-project-three",
    ]);
  });

  it("sorts experiences newest first", async () => {
    const experiences = await getExperiences();

    expect(experiences.length).toBeGreaterThan(1);
    const starts = experiences.map((item) => item.start_date);
    expect(starts).toEqual([...starts].sort((a, b) => b.localeCompare(a)));
  });

  it("returns project with media and rejects unknown or unpublished slugs", async () => {
    const project = await getProject("draft-project-two");

    expect(project?.title).toBe("Draft Project Two");
    expect(project?.media).toEqual([]);
    await expect(getProject("does-not-exist")).resolves.toBeNull();
    await expect(getProject("draft-project-four")).resolves.toBeNull();
  });

  it("returns sorted skills, social links, and merged settings", async () => {
    const [skills, links, settings] = await Promise.all([
      getSkills(),
      getSocialLinks(),
      getSiteSettings(),
    ]);

    expect(skills).toHaveLength(10);
    expect(skills[0]?.sort_order).toBe(1);
    expect(links[0]?.label).toBe("GitHub");
    expect(settings).toHaveProperty("seo");
  });
});

describe("data fallback on database failure", () => {
  beforeEach(() => {
    mocks.hasSupabaseConfig.mockReturnValue(true);
    mocks.getSupabaseClient.mockReturnValue(
      stubClient({ data: null, error: { message: "connection refused" } }),
    );
  });

  it("falls back instead of throwing for every getter", async () => {
    const results = await Promise.all([
      getProfile(),
      getSocialLinks(),
      getExperiences(),
      getProjects(),
      getSkills(),
      getSiteSettings(),
    ]);

    expect(results[0]).toHaveProperty("full_name");
    expect(results[1]).toHaveLength(1);
    expect(results[2]).toHaveLength(2);
    expect(results[3]).toHaveLength(3);
    expect(results[4]).toHaveLength(10);
    expect(results[5]).toHaveProperty("music");
  });

  it("falls back when the client throws", async () => {
    mocks.getSupabaseClient.mockImplementation(() => {
      throw new Error("network down");
    });

    await expect(getProfile()).resolves.toHaveProperty("full_name");
  });
});

describe("data from database", () => {
  it("prefers database rows over the seed", async () => {
    mocks.hasSupabaseConfig.mockReturnValue(true);
    mocks.getSupabaseClient.mockReturnValue(
      stubClient({
        data: { id: "db-id", full_name: "From Database", headline: "Engineer" },
        error: null,
      }),
    );

    const profile = await getProfile();

    expect(profile.full_name).toBe("From Database");
  });

  it("respects an empty database list instead of falling back", async () => {
    mocks.hasSupabaseConfig.mockReturnValue(true);
    mocks.getSupabaseClient.mockReturnValue(stubClient({ data: [], error: null }));

    await expect(getProjects()).resolves.toEqual([]);
  });

  it("reorders shuffled experience rows newest first", async () => {
    // sort_order deliberately contradicts the dates, so this only passes when the
    // data layer sorts by start_date rather than by sort_order.
    const shuffled = [
      { id: "c", role: "Oldest", start_date: "2019-06-01", sort_order: 1 },
      { id: "a", role: "Newest", start_date: "2024-01-01", sort_order: 4 },
      { id: "d", role: "Middle", start_date: "2021-03-01", sort_order: 2 },
      { id: "b", role: "Second", start_date: "2022-09-01", sort_order: 3 },
    ];

    mocks.hasSupabaseConfig.mockReturnValue(true);
    mocks.getSupabaseClient.mockReturnValue(stubClient({ data: shuffled, error: null }));

    const experiences = await getExperiences();

    expect(experiences.map((item) => item.start_date)).toEqual([
      "2024-01-01",
      "2022-09-01",
      "2021-03-01",
      "2019-06-01",
    ]);
  });
});
