import { AppServices } from '@app/core/constants/app-svc.constant';
import { SetMetadata } from '@nestjs/common';

export const Authorize = () => SetMetadata(AppServices.SECURED, true);
export const TempAuthorize = () => SetMetadata(AppServices.TEMP_SECURED, true);
