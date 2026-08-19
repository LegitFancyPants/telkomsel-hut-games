import { prisma } from "./db";

export interface GroupData {
  id: number;
  name: string;
  totalScore: number;
  updatedAt: Date;
}

export interface PostData {
  id: number;
  name: string;
  slug: string;
  pinCode: string;
  gameType: "quiz" | "tap_reflex" | "memory_match" | "speed_math" | "word_scramble" | "snake";
  timeLimit: number;
  isActive: boolean;
}

export interface QuestionData {
  id: number;
  postId: number;
  promptText: string;
  imageUrl?: string | null;
  options: string[];
  correctOpt: string;
  points: number;
}

export interface ScoreLogData {
  id: string;
  groupId: number;
  postId: number;
  pointsAwarded: number;
  deviceToken: string;
  createdAt: Date;
}

// In-Memory Fallback & Seed Data
let memoryGroups: GroupData[] = [
  { id: 1, name: "Kelompok 1 - Garuda", totalScore: 120, updatedAt: new Date() },
  { id: 2, name: "Kelompok 2 - Elang", totalScore: 180, updatedAt: new Date() },
  { id: 3, name: "Kelompok 3 - Harimau", totalScore: 240, updatedAt: new Date() },
  { id: 4, name: "Kelompok 4 - Singa", totalScore: 90, updatedAt: new Date() },
  { id: 5, name: "Kelompok 5 - Serigala", totalScore: 150, updatedAt: new Date() },
];

let memoryPosts: PostData[] = [
  { id: 1, name: "POS 1: GERBANG UTAMA", slug: "pos-1", pinCode: "4829", gameType: "quiz", timeLimit: 60, isActive: true },
  { id: 2, name: "POS 2: AREA KETANGKASAN", slug: "pos-2", pinCode: "1357", gameType: "quiz", timeLimit: 60, isActive: true },
  { id: 3, name: "POS 3: TAMAN WAWASAN", slug: "pos-3", pinCode: "2468", gameType: "memory_match", timeLimit: 300, isActive: true },
  { id: 4, name: "POS 4: LABIRIN STRATEGI", slug: "pos-4", pinCode: "9876", gameType: "speed_math", timeLimit: 45, isActive: true },
  { id: 5, name: "POS 5: TANTANGAN ULAR", slug: "pos-5", pinCode: "5555", gameType: "snake", timeLimit: 300, isActive: true },
];

let memoryQuestions: QuestionData[] = [
  { id: 1, postId: 1, promptText: "TEBAK GAMBAR: Bangunanapakah yang ada pada gambar di bawah ini?", imageUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=600&auto=format&fit=crop&q=80", options: ["Monumen Nasional (Monas)", "Candi Borobudur", "Gedung Sate", "Jam Gadang"], correctOpt: "A", points: 25 },
  { id: 2, postId: 1, promptText: "TEBAK GAMBAR: Burungapakah yang menjadi lambang garuda dalam gambar ini?", imageUrl: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=600&auto=format&fit=crop&q=80", options: ["Burung Elang Jawa", "Burung Merpati", "Burung Cenderawasih", "Burung Kakaktua"], correctOpt: "A", points: 25 },
  { id: 3, postId: 1, promptText: "Berapa jumlah warna utama dalam pelangi dasar?", imageUrl: null, options: ["3 Warna", "5 Warna", "7 Warna", "9 Warna"], correctOpt: "C", points: 20 },
  { id: 4, postId: 1, promptText: "Apa nama ibukota Indonesia yang baru di Kalimantan?", imageUrl: null, options: ["Nusantara", "Ibu Kota Baru", "Penajam", "Balikpapan"], correctOpt: "A", points: 20 },
  { id: 5, postId: 1, promptText: "Berapa jumlah roda pada becak motor konvensional?", imageUrl: null, options: ["2 Roda", "3 Roda", "4 Roda", "5 Roda"], correctOpt: "B", points: 20 },
];

const memoryScoreLogs: ScoreLogData[] = [];

// Seed helper for Neon DB initialization
async function ensureDbSeeded() {
  try {
    const postCount = await prisma.post.count();
    if (postCount === 0) {
      for (const p of memoryPosts) {
        await prisma.post.create({
          data: {
            id: p.id,
            name: p.name,
            slug: p.slug,
            pinCode: p.pinCode,
            gameType: p.gameType,
            timeLimit: p.timeLimit,
            isActive: p.isActive,
          },
        });
      }
    }

    const groupCount = await prisma.group.count();
    if (groupCount === 0) {
      for (const g of memoryGroups) {
        await prisma.group.create({
          data: {
            id: g.id,
            name: g.name,
            totalScore: g.totalScore,
          },
        });
      }
    }

    const questionCount = await prisma.question.count();
    if (questionCount === 0) {
      for (const q of memoryQuestions) {
        await prisma.question.create({
          data: {
            id: q.id,
            postId: q.postId,
            promptText: q.promptText,
            imageUrl: q.imageUrl || null,
            options: JSON.stringify(q.options),
            correctOpt: q.correctOpt,
            points: q.points,
          },
        });
      }
    }
  } catch (e) {
    console.error("Db Seed Warning:", e);
  }
}

// Posts CRUD
export async function getPosts(): Promise<PostData[]> {
  try {
    await ensureDbSeeded();
    const posts = await prisma.post.findMany({ orderBy: { id: "asc" } });
    if (posts.length > 0) {
      return posts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        pinCode: p.pinCode,
        gameType: p.gameType as any,
        timeLimit: p.timeLimit,
        isActive: p.isActive,
      }));
    }
  } catch (e) {
    console.error("getPosts Error:", e);
  }
  return memoryPosts;
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  try {
    await ensureDbSeeded();
    const post = await prisma.post.findUnique({ where: { slug } });
    if (post) {
      return {
        id: post.id,
        name: post.name,
        slug: post.slug,
        pinCode: post.pinCode,
        gameType: post.gameType as any,
        timeLimit: post.timeLimit,
        isActive: post.isActive,
      };
    }
  } catch (e) {
    console.error("getPostBySlug Error:", e);
  }
  return memoryPosts.find((p: PostData) => p.slug === slug) || null;
}

export async function createPost(data: Omit<PostData, "id">): Promise<PostData> {
  try {
    const created = await prisma.post.create({
      data: {
        name: data.name,
        slug: data.slug,
        pinCode: data.pinCode,
        gameType: data.gameType,
        timeLimit: data.timeLimit,
        isActive: data.isActive,
      },
    });
    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      pinCode: created.pinCode,
      gameType: created.gameType as any,
      timeLimit: created.timeLimit,
      isActive: created.isActive,
    };
  } catch (e) {
    console.error("createPost Error:", e);
  }
  const newPost: PostData = { id: memoryPosts.length + 1, ...data };
  memoryPosts.push(newPost);
  return newPost;
}

export async function updatePost(id: number, data: Partial<PostData>): Promise<PostData | null> {
  try {
    await ensureDbSeeded();
    
    // Check if post exists in DB first to do upsert or update
    const existing = await prisma.post.findUnique({ where: { id } });

    let updated: any;
    if (existing) {
      updated = await prisma.post.update({
        where: { id },
        data,
      });
    } else {
      updated = await prisma.post.create({
        data: {
          id,
          name: data.name || `POS #${id}`,
          slug: data.slug || `pos-${id}`,
          pinCode: data.pinCode || "1234",
          gameType: (data.gameType as any) || "quiz",
          timeLimit: data.timeLimit || 60,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    }

    // Sync memory state
    const idx = memoryPosts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryPosts[idx] = { ...memoryPosts[idx], ...data };
    } else {
      memoryPosts.push({
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        pinCode: updated.pinCode,
        gameType: updated.gameType as any,
        timeLimit: updated.timeLimit,
        isActive: updated.isActive,
      });
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      pinCode: updated.pinCode,
      gameType: updated.gameType as any,
      timeLimit: updated.timeLimit,
      isActive: updated.isActive,
    };
  } catch (e) {
    console.error("updatePost Error:", e);
  }

  const idx = memoryPosts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memoryPosts[idx] = { ...memoryPosts[idx], ...data };
    return memoryPosts[idx];
  }
  return null;
}

export async function deletePost(id: number): Promise<boolean> {
  try {
    await prisma.post.delete({ where: { id } });
    memoryPosts = memoryPosts.filter((p) => p.id !== id);
    return true;
  } catch (e) {
    console.error("deletePost Error:", e);
  }
  memoryPosts = memoryPosts.filter((p) => p.id !== id);
  return true;
}

// Groups CRUD
export async function getGroups(): Promise<GroupData[]> {
  try {
    await ensureDbSeeded();
    const groups = await prisma.group.findMany({ orderBy: { totalScore: "desc" } });
    if (groups.length > 0) return groups;
  } catch (e) {
    console.error("getGroups Error:", e);
  }
  return [...memoryGroups].sort((a, b) => b.totalScore - a.totalScore);
}

export async function getGroupById(id: number): Promise<GroupData | null> {
  try {
    await ensureDbSeeded();
    const group = await prisma.group.findUnique({ where: { id } });
    if (group) return group;
  } catch (e) {
    console.error("getGroupById Error:", e);
  }
  return memoryGroups.find((g: GroupData) => g.id === id) || null;
}

export async function createGroup(name: string): Promise<GroupData> {
  try {
    const created = await prisma.group.create({
      data: { name, totalScore: 0 },
    });
    return created;
  } catch (e) {
    console.error("createGroup Error:", e);
  }
  const newGroup: GroupData = { id: memoryGroups.length + 1, name, totalScore: 0, updatedAt: new Date() };
  memoryGroups.push(newGroup);
  return newGroup;
}

export async function updateGroup(id: number, name?: string, scoreOverride?: number): Promise<GroupData | null> {
  try {
    await ensureDbSeeded();
    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (scoreOverride !== undefined) updatePayload.totalScore = scoreOverride;

    const existing = await prisma.group.findUnique({ where: { id } });
    let updated: any;

    if (existing) {
      updated = await prisma.group.update({
        where: { id },
        data: updatePayload,
      });
    } else {
      updated = await prisma.group.create({
        data: {
          id,
          name: name || `Kelompok #${id}`,
          totalScore: scoreOverride !== undefined ? scoreOverride : 0,
        },
      });
    }

    const idx = memoryGroups.findIndex((g) => g.id === id);
    if (idx !== -1) {
      if (name !== undefined) memoryGroups[idx].name = name;
      if (scoreOverride !== undefined) memoryGroups[idx].totalScore = scoreOverride;
      memoryGroups[idx].updatedAt = new Date();
    }

    return updated;
  } catch (e) {
    console.error("updateGroup Error:", e);
  }
  const idx = memoryGroups.findIndex((g) => g.id === id);
  if (idx !== -1) {
    if (name !== undefined) memoryGroups[idx].name = name;
    if (scoreOverride !== undefined) memoryGroups[idx].totalScore = scoreOverride;
    memoryGroups[idx].updatedAt = new Date();
    return memoryGroups[idx];
  }
  return null;
}

export async function deleteGroup(id: number): Promise<boolean> {
  try {
    await prisma.group.delete({ where: { id } });
    memoryGroups = memoryGroups.filter((g) => g.id !== id);
    return true;
  } catch (e) {
    console.error("deleteGroup Error:", e);
  }
  memoryGroups = memoryGroups.filter((g) => g.id !== id);
  return true;
}

export async function resetAllScores(): Promise<boolean> {
  try {
    await prisma.group.updateMany({ data: { totalScore: 0 } });
    memoryGroups.forEach((g) => (g.totalScore = 0));
    return true;
  } catch (e) {
    console.error("resetAllScores Error:", e);
  }
  memoryGroups.forEach((g) => (g.totalScore = 0));
  return true;
}

// Questions CRUD
export async function getQuestionsByPostId(postId: number): Promise<QuestionData[]> {
  try {
    await ensureDbSeeded();
    const questions = await prisma.question.findMany({ where: { postId }, orderBy: { id: "asc" } });
    if (questions.length > 0) {
      return questions.map((q: any) => ({
        id: q.id,
        postId: q.postId,
        promptText: q.promptText,
        imageUrl: q.imageUrl,
        options: JSON.parse(q.options),
        correctOpt: q.correctOpt,
        points: q.points,
      }));
    }
  } catch (e) {
    console.error("getQuestionsByPostId Error:", e);
  }
  return memoryQuestions.filter((q: QuestionData) => q.postId === postId);
}

export async function createQuestion(data: Omit<QuestionData, "id">): Promise<QuestionData> {
  try {
    const created = await prisma.question.create({
      data: {
        postId: data.postId,
        promptText: data.promptText,
        imageUrl: data.imageUrl || null,
        options: JSON.stringify(data.options),
        correctOpt: data.correctOpt,
        points: data.points,
      },
    });
    return {
      id: created.id,
      postId: created.postId,
      promptText: created.promptText,
      imageUrl: created.imageUrl,
      options: JSON.parse(created.options),
      correctOpt: created.correctOpt,
      points: created.points,
    };
  } catch (e) {
    console.error("createQuestion Error:", e);
  }
  const newQ: QuestionData = { id: memoryQuestions.length + 1, ...data };
  memoryQuestions.push(newQ);
  return newQ;
}

export async function deleteQuestion(id: number): Promise<boolean> {
  try {
    await prisma.question.delete({ where: { id } });
    memoryQuestions = memoryQuestions.filter((q) => q.id !== id);
    return true;
  } catch (e) {
    console.error("deleteQuestion Error:", e);
  }
  memoryQuestions = memoryQuestions.filter((q) => q.id !== id);
  return true;
}

export async function submitScore(
  groupId: number,
  postId: number,
  pointsEarned: number,
  deviceToken: string
): Promise<{ success: boolean; newTotalScore: number; pointsEarned: number }> {
  try {
    await ensureDbSeeded();
    const updatedGroup = await prisma.$transaction(async (tx: any) => {
      const recentLog = await tx.scoreLog.findFirst({
        where: {
          postId,
          deviceToken,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
      });

      if (recentLog) {
        throw new Error("Pemberitahuan: Perangkat ini telah melakukan submission di pos ini dalam 5 menit terakhir.");
      }

      await tx.scoreLog.create({
        data: {
          groupId,
          postId,
          pointsAwarded: pointsEarned,
          deviceToken,
        },
      });

      const group = await tx.group.update({
        where: { id: groupId },
        data: {
          totalScore: { increment: pointsEarned },
        },
      });

      return group;
    });

    return {
      success: true,
      newTotalScore: updatedGroup.totalScore,
      pointsEarned,
    };
  } catch (e: any) {
    if (e.message?.includes("5 menit terakhir")) {
      throw e;
    }
    console.error("submitScore Error:", e);
    const group = memoryGroups.find((g: GroupData) => g.id === groupId);
    if (group) {
      group.totalScore += pointsEarned;
      group.updatedAt = new Date();
    }
    memoryScoreLogs.push({
      id: "log_" + Date.now(),
      groupId,
      postId,
      pointsAwarded: pointsEarned,
      deviceToken,
      createdAt: new Date(),
    });
    return {
      success: true,
      newTotalScore: group ? group.totalScore : pointsEarned,
      pointsEarned,
    };
  }
}
