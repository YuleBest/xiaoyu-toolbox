import { simpleGit } from "simple-git";
import type { SimpleGit } from "simple-git";
import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

interface FileCommitLog {
  filePath: string;
  commits: {
    hash: string;
    date: string;
    message: string;
    author_name: string;
  }[];
}

async function getGitLogToJson(
  targetDir: string,
  pattern: string = "**/*.vue",
  outputFile: string = "../commit.log.json",
) {
  const git: SimpleGit = simpleGit();
  const results: FileCommitLog[] = [];

  try {
    // 获取所有匹配的文件路径
    const files = await glob(pattern, { cwd: targetDir, absolute: true });

    console.log(`Found ${files.length} files matching "${pattern}"`);

    for (const file of files) {
      // 获取单个文件的 git log
      // file 是绝对路径，simple-git 会自动处理
      console.log(`Get Log: ${file} ...`);
      const log = await git.log({ file });

      results.push({
        filePath: path.relative(targetDir, file),
        commits: log.all.map((commit) => ({
          hash: commit.hash.substring(0, 6),
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
        })),
      });
    }

    // 写入 JSON
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), "utf-8");
    console.log(`Successfully saved commit logs to ${outputFile}`);
  } catch (error) {
    console.error("Error fetching git logs:", error);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetPath = path.resolve(__dirname, "../src/pages");
const outputPath = path.resolve(__dirname, "../src/assets/_commit.log.json");

getGitLogToJson(targetPath, "**/*.vue", outputPath);
