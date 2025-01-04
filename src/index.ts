import process from 'node:process';
import fsPromises from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Options for finding a file or directory.
 */
export type Options = {
    /**
     * The directory to start from.
     *
     * @default process.cwd()
     */
    readonly cwd?: URL | string;

    /**
     * The type of path to match.
     *
     * @default 'file'
     */
    readonly type?: 'file' | 'directory';

    /**
     * A directory path where the search halts if no matches are found before reaching this point.
     *
     * Default: Root directory
     */
    readonly stopAt?: URL | string;
};

/**
 * Converts a URL or path-like object to a file system path.
 *
 * @param urlOrPath - The input to convert.
 * @returns A file system path.
 */
const toPath = (urlOrPath: URL | string): string =>
    urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

// noinspection JSUnusedGlobalSymbols
/**
 * Find a file or directory by walking up parent directories asynchronously.
 *
 * @param name - The name of the file or directory to find.
 * @param options - Configuration options.
 * @returns The found path or `undefined` if it could not be found.
 *
 * @example
 * ```
 * import { findUp } from './index';
 *
 * console.log(await findUp('unicorn.png'));
 * //=> '/Users/sindresorhus/unicorn.png'
 * ```
 */
export async function findUp(
    name: string,
    options?: Options
): Promise<string | undefined> {
    const { cwd = process.cwd(), type = 'file', stopAt } = options ?? {};

    let directory = path.resolve(toPath(cwd) ?? '');
    const { root } = path.parse(directory);
    const resolvedStopAt = path.resolve(directory, toPath(stopAt ?? root));

    while (directory && directory !== resolvedStopAt && directory !== root) {
        const filePath = path.isAbsolute(name)
            ? name
            : path.join(directory, name);

        try {
            const stats = await fsPromises.stat(filePath);
            if (
                (type === 'file' && stats.isFile()) ||
                (type === 'directory' && stats.isDirectory())
            ) {
                return filePath;
            }
        } catch {
            /* empty */
        }

        directory = path.dirname(directory);
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Find a file or directory by walking up parent directories synchronously.
 *
 * @param name - The name of the file or directory to find.
 * @param options - Configuration options.
 * @returns The found path or `undefined` if it could not be found.
 *
 * @example
 * ```
 * import { findUpSync } from './index';
 *
 * console.log(findUpSync('unicorn.png'));
 * //=> '/Users/sindresorhus/unicorn.png'
 * ```
 */
export function findUpSync(
    name: string,
    options?: Options
): string | undefined {
    const { cwd = process.cwd(), type = 'file', stopAt } = options ?? {};

    let directory = path.resolve(toPath(cwd) ?? '');
    const { root } = path.parse(directory);
    const resolvedStopAt = path.resolve(directory, toPath(stopAt ?? root));

    while (directory && directory !== resolvedStopAt && directory !== root) {
        const filePath = path.isAbsolute(name)
            ? name
            : path.join(directory, name);

        try {
            const stats = fs.statSync(filePath, { throwIfNoEntry: false });
            if (
                (type === 'file' && stats?.isFile()) ||
                (type === 'directory' && stats?.isDirectory())
            ) {
                return filePath;
            }
        } catch {
            /* empty */
        }

        directory = path.dirname(directory);
    }
}
