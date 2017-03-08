import { IComponentDefinition } from '../Base/Component';
import { Initialization } from '../Base/Initialization';
import { lazyExport } from '../../GlobalExports';

export function lazyResultAttachment() {
  Initialization.registerLazyComponent('ResultAttachments', () => {
    return new Promise((resolve, reject) => {
      require.ensure(['./ResultAttachments'], () => {
        let loaded = require<IComponentDefinition>('./ResultAttachments.ts')['ResultAttachments'];
        lazyExport(loaded, resolve);
      }, 'ResultAttachments');
    });
  });
}
