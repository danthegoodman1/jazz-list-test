import { co, z, type CoListSchema } from "jazz-tools"

const Project = co.map({
  name: z.string(),
  startDate: z.date(),
  status: z.literal(["planning", "active", "completed"]),

  get subProjects(): z.ZodOptional<CoListSchema<typeof Project>> {
    return z.optional(co.list(Project))
  },
})
export type Project = co.loaded<typeof Project>

const Task = co.map({
  name: z.string(),
  description: z.string(),
  status: z.literal(["todo", "in_progress", "done"]),
  project: z.optional(Project),

  get projectz(): z.ZodOptional<typeof Project> {
    return z.optional(Project)
  },
})
export type Task = co.loaded<typeof Task>

const t = Task.create({
  name: "Test Task",
  description: "This is a test task",
  status: "todo",

  // project: Project.create({
  //   name: "Test Project",
  //   startDate: new Date(),
  //   status: "planning",
  // }),
  project: undefined,

  projectz: Project.create({
    name: "Test Project",
    startDate: new Date(),
    status: "planning",
    subProjects: co.list(Project).create([]),
  }),
  // projectz: undefined,
})
