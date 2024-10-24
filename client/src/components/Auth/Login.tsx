import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
//import { useGetStartupConfig } from 'librechat-data-provider/react-query';
import {
  GoogleIcon,
  FacebookIcon,
  OpenIDIcon,
  GithubIcon,
  DiscordIcon,
  LarkIcon,
} from '~/components';
import { useAuthContext } from '~/hooks/AuthContext';
import type { TLoginLayoutContext } from '~/common';
import { ErrorMessage } from '~/components/Auth/ErrorMessage';
import { getLoginError } from '~/utils';
import { useLocalize } from '~/hooks';
import LoginForm from './LoginForm';

function Login() {
  const localize = useLocalize();
  const { error, setError, login } = useAuthContext();
  const { startupConfig } = useOutletContext<TLoginLayoutContext>();

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <div className="mt-12 h-24 w-full bg-cover">
        <img src="/assets/logo.svg" className="h-full w-full object-contain" alt="Logo" />
      </div>

      <div className="flex flex-grow items-center justify-center">
        <div className="w-authPageWidth overflow-hidden bg-white px-6 py-4 dark:bg-gray-900 sm:max-w-md sm:rounded-lg">
          {error && (
            <div
              className="rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-gray-600 dark:text-gray-200"
              role="alert"
            >
              {localize(getLoginError(error))}
            </div>
          )}

          {startupConfig?.larkLoginEnabled && startupConfig.socialLoginEnabled && (
            <>
              <div className="mt-2 flex gap-x-2">
                <a
                  aria-label="Login with Lark"
                  className="justify-left flex w-full items-center space-x-3 rounded-md border border-gray-300 px-5 py-3 hover:bg-gray-50 focus:ring-2 focus:ring-violet-600 focus:ring-offset-1"
                  href={`${startupConfig.serverDomain}/oauth/lark`}
                >
                  <LarkIcon />
                  <p>雨揚集團 {localize('com_auth_lark_login')}</p>
                </a>
              </div>
            </>
          )}
          {startupConfig?.larkLoginEnabled && startupConfig.socialLoginEnabled && (
            <>
              <div className="mt-2 flex gap-x-2">
                <a
                  aria-label="Login with Lark"
                  className="justify-left flex w-full items-center space-x-3 rounded-md border border-gray-300 px-5 py-3 hover:bg-gray-50 focus:ring-2 focus:ring-violet-600 focus:ring-offset-1"
                  href={`${startupConfig.serverDomain}/oauth/aro`}
                >
                  <LarkIcon />
                  <p>漾品啟鎂 {localize('com_auth_lark_login')}</p>
                </a>
              </div>
            </>
          )}
          {startupConfig?.larkLoginEnabled && startupConfig.socialLoginEnabled && (
            <>
              <div className="mt-2 flex gap-x-2">
                <a
                  aria-label="Login with Lark"
                  className="justify-left flex w-full items-center space-x-3 rounded-md border border-gray-300 px-5 py-3 hover:bg-gray-50 focus:ring-2 focus:ring-violet-600 focus:ring-offset-1"
                  href={`${startupConfig.serverDomain}/oauth/bi`}
                >
                  <LarkIcon />
                  <p>億佳智能 {localize('com_auth_lark_login')}</p>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
