import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {asWindowsPath, resolve} from '@angular-devkit/core';
import chalk from 'chalk';
import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {buildTarget} from '../bazel/build-target';
import {checkBazelInstallation} from '../bazel/check-installation';
import {Schema} from './schema';

export class BundleBuilder implements Builder<Schema> {

  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<Partial<Schema>>): Observable<BuildEvent> {
    const projectRoot = asWindowsPath(
        resolve(this.context.workspace.root, builderConfig.root));
    const targetLabel = builderConfig.options.targetLabel;

    if (!checkBazelInstallation(projectRoot)) {
      throw new Error('Could not run Bazel. Please make sure that the "bazel" command is' +
          'available in the $PATH.');
    }

    console.info(chalk.green('Building Bazel target:'), chalk.yellow(targetLabel));

    // TODO: Support passing flags.
    return buildTarget(projectRoot, targetLabel, [])
      .pipe(
        map(() => ({success: true})),
        catchError(() => of({success: false})),
        tap(() => console.info(chalk.green('Successfully built:'), chalk.yellow(targetLabel))));
  }

}

export default BundleBuilder;
