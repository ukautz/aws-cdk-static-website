import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

export const assertSnapshot = (stack: cdk.Stack) => {
  test('Snapshot is consistent', () => {
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
};
