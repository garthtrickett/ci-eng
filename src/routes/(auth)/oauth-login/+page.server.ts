import { withClient } from '$lib/client/helpers/api';

withClient((c) => c.api.tasks.$get());
