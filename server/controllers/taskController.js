// import prisma from "../configs/prisma.js";
// import { inngest } from "../inngest/index.js";

// // Create task
// export const createTask = async (req, res) => {
//   try {
//     const { userId } = await req.auth();
//     const {
//       projectId,
//       title,
//       description,
//       type,
//       status,
//       priority,
//       assigneeId,
//     } = req.body;
//     const origin = req.get("origin");

//     // Check if user has admin role for project
//     const project = await prisma.project.findUnique({
//       where: { id: projectId },
//       include: { members: { include: { user: true } } },
//     });

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     } else if (project.team_lead !== userId) {
//       return res
//         .status(403)
//         .json({ message: "You don't have admin privileges for this project" });
//     } else if (
//       assigneeId &&
//       !project.members.find((member) => member.user.id === assigneeId)
//     ) {
//       return res.status(403).json({
//         message: "assignee is not a member of the project / workspace",
//       });
//     }

//     const task = await prisma.task.create({
//       data: {
//         projectId,
//         title,
//         description,
//         priority,
//         assigneeId,
//         status,
//         due_date: new Date(due_date),
//       },
//     });

//     const taskWithAssignee = await prisma.task.findUnique({
//       where: { id: task.id },
//       include: { assignee: true },
//     });

//     await inngest.send({
//       name: "app/task.assigned",
//       data: {
//         taskId: task.id,
//         origin,
//       },
//     });

//     res.json({ task: taskWithAssignee, message: "Task created successfully" });

//     //* CATCH
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.code || error.message });
//   }
// };
// // Update task
// export const updateTask = async (req, res) => {
//   try {
//     const task = await prisma.task.findUnique({
//       where: { id: req.params.id },
//     });

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const { userId } = await req.auth();
//     // const {
//     //   projectId,
//     //   title,
//     //   description,
//     //   type,
//     //   status,
//     //   priority,
//     //   assigneeId,
//     // } = req.body;
//     // const origin = req.get("origin");

//     const project = await prisma.project.findUnique({
//       where: { id: task.projectId },
//       include: { members: { include: { user: true } } },
//     });

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     } else if (project.team_lead !== userId) {
//       return res
//         .status(403)
//         .json({ message: "You don't have admin privileges for this project" });
//     }

//     const updatedTask = await prisma.task.update({
//       where: { id: req.params.id },
//       data: req.body,
//     });

//     // const task = await prisma.task.create({
//     //   data: {
//     //     projectId,
//     //     title,
//     //     description,
//     //     priority,
//     //     assigneeId,
//     //     status,
//     //     due_date: new Date(due_date),
//     //   },
//     // });

//     // const taskWithAssignee = await prisma.task.findUnique({
//     //   where: { id: task.id },
//     //   include: { assignee: true },
//     // });

//     res.json({ task: updateTask, message: "Task updated successfully" });

//     //* CATCH
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.code || error.message });
//   }
// };
// // Delete task
// export const deleteTask = async (req, res) => {
//   try {
//     // const task = await prisma.task.findUnique({
//     //   where: { id: req.params.id },
//     // });

//     // if (!task) {
//     //   return res.status(404).json({ message: "Task not found" });
//     // }

//     const { userId } = await req.auth();
//     const { tasksIds } = req.body;
//     const tasks = await prisma.task.findMany({
//       where: { id: { in: tasksIds } },
//     });

//     if (tasks.length === 0) {
//       return res.status(404).json({ message: "Task not found" });
//     }
//     // const {
//     //   projectId,
//     //   title,
//     //   description,
//     //   type,
//     //   status,
//     //   priority,
//     //   assigneeId,
//     // } = req.body;
//     // const origin = req.get("origin");

//     const project = await prisma.project.findUnique({
//       where: { id: tasks[0].projectId },
//       include: { members: { include: { user: true } } },
//     });

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     } else if (project.team_lead !== userId) {
//       return res
//         .status(403)
//         .json({ message: "You don't have admin privileges for this project" });
//     }

//     // const updatedTask = await prisma.task.update({
//     //   where: { id: req.params.id },
//     //   data: req.body,
//     // });

//     // const task = await prisma.task.create({
//     //   data: {
//     //     projectId,
//     //     title,
//     //     description,
//     //     priority,
//     //     assigneeId,
//     //     status,
//     //     due_date: new Date(due_date),
//     //   },
//     // });

//     // const taskWithAssignee = await prisma.task.findUnique({
//     //   where: { id: task.id },
//     //   include: { assignee: true },
//     // });

//     await prisma.task.deleteMany({
//       where: { id: { in: tasksIds } },
//     });

//     res.json({ message: "Task deleted successfully" });

//     //* CATCH
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.code || error.message });
//   }
// };
import prisma from "../configs/prisma.js";
import { inngest } from "../inngest/index.js";

// Helper: verify if user is admin (team_lead) of project
const verifyProjectAdmin = async (projectId, userId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { include: { user: true } } },
  });
  if (!project) throw { status: 404, message: "Project not found" };
  if (project.team_lead !== userId)
    throw {
      status: 403,
      message: "You don't have admin privileges for this project",
    };
  return project;
};

// Create task
export const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
    } = req.body;
    const origin = req.get("origin");

    const project = await verifyProjectAdmin(projectId, userId);

    if (
      assigneeId &&
      !project.members.find((member) => member.user.id === assigneeId)
    ) {
      return res.status(403).json({
        message: "Assignee is not a member of the project / workspace",
      });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        type,
        priority,
        assigneeId,
        status,
        due_date: new Date(due_date),
      },
      include: { assignee: true },
    });

    await inngest.send({
      name: "app/task.assigned",
      data: { taskId: task.id, origin },
    });

    res.json({ task, message: "Task created successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ message: error.message || error.code });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { userId } = await req.auth();
    const project = await verifyProjectAdmin(task.projectId, userId);

    // Optional: validate assigneeId if being updated
    if (
      req.body.assigneeId &&
      !project.members.find((member) => member.user.id === req.body.assigneeId)
    ) {
      return res.status(403).json({
        message: "Assignee is not a member of the project / workspace",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: { assignee: true },
    });

    res.json({ task: updatedTask, message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ message: error.message || error.code });
  }
};

// Delete task(s)
export const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { tasksIds } = req.body;

    const tasks = await prisma.task.findMany({
      where: { id: { in: tasksIds } },
    });
    if (tasks.length === 0)
      return res.status(404).json({ message: "Task(s) not found" });

    const project = await verifyProjectAdmin(tasks[0].projectId, userId);

    // Optional: ensure all tasks belong to same project
    const invalidTasks = tasks.filter((t) => t.projectId !== project.id);
    if (invalidTasks.length)
      return res
        .status(400)
        .json({ message: "All tasks must belong to the same project" });

    await prisma.task.deleteMany({ where: { id: { in: tasksIds } } });

    res.json({ message: "Task(s) deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ message: error.message || error.code });
  }
};
