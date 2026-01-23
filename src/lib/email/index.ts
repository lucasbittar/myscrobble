import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'MyScrobble <hello@myscrobble.fm>';

type Locale = 'en' | 'pt-BR';

// Email translations
const translations = {
  welcome: {
    en: {
      subject: "🎫 You're on the guest list!",
      title: "You're on the guest list!",
      earlyAccess: "Early Access",
      guestList: "Guest List",
      waitlist: "Waitlist",
      yourPosition: "Your Position",
      admitOne: "Admit One",
      greeting: (name: string) => `Hey ${name}!`,
      message1: `You're officially on the <span style="color: #EC4899; font-weight: 600;">guest list</span>. We're at capacity right now, but your spot is saved.`,
      message2: "When doors open, you'll be first in line. Keep an eye on your inbox.",
      whatsWaiting: "What's waiting for you",
      feature1: "Deep listening stats & top charts",
      feature2: "AI-powered recommendations",
      feature3: "Concert discovery",
      feature4: "Shareable social cards",
      footer: "Made with ♥ by",
    },
    'pt-BR': {
      subject: "🎫 Você está na lista!",
      title: "Você está na lista!",
      earlyAccess: "Acesso Antecipado",
      guestList: "Lista de Espera",
      waitlist: "Aguardando",
      yourPosition: "Sua Posição",
      admitOne: "Entrada Individual",
      greeting: (name: string) => `E aí, ${name}!`,
      message1: `Você está oficialmente na <span style="color: #EC4899; font-weight: 600;">lista de espera</span>. Estamos no limite agora, mas seu lugar está garantido.`,
      message2: "Quando as portas abrirem, você será o primeiro da fila. Fique de olho no seu e-mail.",
      whatsWaiting: "O que te espera",
      feature1: "Estatísticas detalhadas e top charts",
      feature2: "Recomendações com IA",
      feature3: "Descoberta de shows",
      feature4: "Cards compartilháveis",
      footer: "Feito com ♥ por",
    },
  },
  accessGranted: {
    en: {
      subject: "🎉 You're in! Your VIP pass is ready",
      title: "You're in!",
      brandName: "MyScrobble.fm",
      backstagePass: "Backstage Pass",
      vip: "VIP",
      accessGranted: "ACCESS GRANTED",
      fullAccess: "Full Access • All Areas",
      enterButton: "Enter MyScrobble →",
      greeting: (name: string) => `Hey ${name}!`,
      message1: `The wait is over. <span style="color: #1DB954; font-weight: 600;">Your spot is ready.</span>`,
      message2: "Log in with Spotify and start exploring your music story — top artists, personalized recommendations, upcoming concerts, and more.",
      nowUnlocked: "Now unlocked",
      feature1: "Your top artists, tracks & albums",
      feature2: "AI recommendations just for you",
      feature3: "Concerts from artists you love",
      feature4: "Your personalized Wrapped",
      secondaryCta: "🎧 Start exploring",
      footer: "Made with ♥ by",
    },
    'pt-BR': {
      subject: "🎉 Você entrou! Seu passe VIP está pronto",
      title: "Você entrou!",
      brandName: "MyScrobble.fm",
      backstagePass: "Passe Backstage",
      vip: "VIP",
      accessGranted: "ACESSO LIBERADO",
      fullAccess: "Acesso Total • Todas as Áreas",
      enterButton: "Entrar no MyScrobble →",
      greeting: (name: string) => `E aí, ${name}!`,
      message1: `A espera acabou. <span style="color: #1DB954; font-weight: 600;">Seu lugar está pronto.</span>`,
      message2: "Faça login com o Spotify e comece a explorar sua história musical — artistas favoritos, recomendações personalizadas, shows e muito mais.",
      nowUnlocked: "Agora desbloqueado",
      feature1: "Seus artistas, músicas e álbuns favoritos",
      feature2: "Recomendações de IA só pra você",
      feature3: "Shows dos artistas que você ama",
      feature4: "Seu Wrapped personalizado",
      secondaryCta: "🎧 Começar a explorar",
      footer: "Feito com ♥ por",
    },
  },
};

interface SendWelcomeEmailParams {
  to: string;
  name?: string;
  position: number;
  locale?: Locale;
}

interface SendAccessGrantedEmailParams {
  to: string;
  name?: string;
  locale?: Locale;
}

export async function sendWelcomeEmail({ to, name, position, locale = 'en' }: SendWelcomeEmailParams) {
  const t = translations.welcome[locale] || translations.welcome.en;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: t.subject,
      html: getWelcomeEmailHtml({ name, position, locale }),
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendAccessGrantedEmail({ to, name, locale = 'en' }: SendAccessGrantedEmailParams) {
  const t = translations.accessGranted[locale] || translations.accessGranted.en;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: t.subject,
      html: getAccessGrantedEmailHtml({ name, locale }),
    });

    if (error) {
      console.error('Failed to send access granted email:', error);
      return { success: false, error };
    }

    console.log('Access granted email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending access granted email:', error);
    return { success: false, error };
  }
}

function getWelcomeEmailHtml({ name, position, locale = 'en' }: { name?: string; position: number; locale?: Locale }) {
  const t = translations.welcome[locale] || translations.welcome.en;
  const greeting = name ? name : 'there';
  const paddedPosition = String(position).padStart(3, '0');

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f8f8;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto;">

          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <span style="font-size: 26px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">MyScrobble</span>
              <span style="font-size: 17px; color: #EC4899; font-weight: 600;">.fm</span>
            </td>
          </tr>

          <!-- Ticket Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08); overflow: hidden;">

                <!-- Ticket Header -->
                <tr>
                  <td style="padding: 24px 24px 20px 24px; border-bottom: 1px dashed #e5e5e5;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0; font-family: 'DM Mono', monospace; font-size: 10px; color: #EC4899; text-transform: uppercase; letter-spacing: 2px; font-weight: 500;">${t.earlyAccess}</p>
                          <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #1a1a1a;">${t.guestList}</p>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                          <span style="display: inline-block; padding: 5px 12px; background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); border-radius: 20px; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">${t.waitlist}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Position Section -->
                <tr>
                  <td style="padding: 32px 24px; text-align: center; background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);">
                    <p style="margin: 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 2px;">${t.yourPosition}</p>
                    <p style="margin: 12px 0 0 0; font-family: 'DM Mono', monospace; font-size: 72px; font-weight: 500; color: #EC4899; letter-spacing: -3px; line-height: 1;">#${paddedPosition}</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto 0 auto;">
                      <tr>
                        <td style="padding: 6px 16px; border: 1px solid #e5e5e5; border-radius: 4px; background: #fafafa;">
                          <span style="font-family: 'DM Mono', monospace; font-size: 10px; color: #666666; letter-spacing: 2px; text-transform: uppercase;">${t.admitOne}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Barcode Decoration -->
                <tr>
                  <td style="padding: 0 24px 20px 24px; text-align: center;">
                    <table role="presentation" cellspacing="2" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="width: 2px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 1px; height: 20px; background: #d0d0d0;"></td>
                        <td style="width: 3px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 1px; height: 20px; background: #c8c8c8;"></td>
                        <td style="width: 2px; height: 20px; background: #d5d5d5;"></td>
                        <td style="width: 3px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 1px; height: 20px; background: #d0d0d0;"></td>
                        <td style="width: 2px; height: 20px; background: #c8c8c8;"></td>
                        <td style="width: 3px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 1px; height: 20px; background: #d5d5d5;"></td>
                        <td style="width: 2px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 3px; height: 20px; background: #c8c8c8;"></td>
                        <td style="width: 1px; height: 20px; background: #d0d0d0;"></td>
                        <td style="width: 2px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 3px; height: 20px; background: #d5d5d5;"></td>
                        <td style="width: 1px; height: 20px; background: #c8c8c8;"></td>
                        <td style="width: 2px; height: 20px; background: #e0e0e0;"></td>
                        <td style="width: 3px; height: 20px; background: #d0d0d0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Message Section -->
          <tr>
            <td style="padding: 32px 4px;">
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${t.greeting(greeting)}</h1>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                ${t.message1}
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #555555;">
                ${t.message2}
              </p>
            </td>
          </tr>

          <!-- Features Section -->
          <tr>
            <td style="padding: 0 4px 32px 4px;">
              <p style="margin: 0 0 14px 0; font-family: 'DM Mono', monospace; font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 2px;">${t.whatsWaiting}</p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(29,185,84,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">📊</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature1}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>

                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(139,92,246,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🤖</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature2}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>

                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(236,72,153,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🎤</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature3}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>

                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(245,158,11,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">✨</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature4}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 24px 4px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #999999;">
                ${t.footer} <a href="https://lucasbittar.dev" style="color: #888888; text-decoration: none;">Lucas Bittar</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #bbbbbb;">
                © ${new Date().getFullYear()} MyScrobble.fm
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function getAccessGrantedEmailHtml({ name, locale = 'en' }: { name?: string; locale?: Locale }) {
  const t = translations.accessGranted[locale] || translations.accessGranted.en;
  const greeting = name ? name : 'there';

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f8f8;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f8f8;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto;">

          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <span style="font-size: 26px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">MyScrobble</span>
              <span style="font-size: 17px; color: #1DB954; font-weight: 600;">.fm</span>
            </td>
          </tr>

          <!-- VIP Pass Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08); overflow: hidden;">

                <!-- Pass Header -->
                <tr>
                  <td style="padding: 24px 24px 20px 24px; background: linear-gradient(135deg, rgba(29,185,84,0.06) 0%, rgba(20,184,166,0.04) 100%); border-bottom: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0; font-family: 'DM Mono', monospace; font-size: 10px; color: #1DB954; text-transform: uppercase; letter-spacing: 2px; font-weight: 500;">${t.brandName}</p>
                          <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #1a1a1a;">${t.backstagePass}</p>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                          <span style="display: inline-block; padding: 5px 12px; background: linear-gradient(135deg, #1DB954 0%, #14B8A6 100%); border-radius: 20px; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">${t.vip}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Celebration Section -->
                <tr>
                  <td style="padding: 36px 24px; text-align: center;">
                    <p style="margin: 0; font-size: 52px; line-height: 1;">🎉</p>
                    <p style="margin: 16px 0 0 0; font-size: 28px; font-weight: 700; color: #1DB954; letter-spacing: -0.5px;">${t.accessGranted}</p>
                    <p style="margin: 8px 0 0 0; font-family: 'DM Mono', monospace; font-size: 11px; color: #888888; letter-spacing: 1px; text-transform: uppercase;">${t.fullAccess}</p>
                  </td>
                </tr>

                <!-- Accent Strip -->
                <tr>
                  <td style="padding: 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #1DB954 0%, #14B8A6 25%, #8B5CF6 50%, #EC4899 75%, #1DB954 100%);"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Section -->
                <tr>
                  <td style="padding: 28px 24px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background: #1DB954; border-radius: 12px;">
                          <a href="https://myscrobble.fm" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                            ${t.enterButton}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Message Section -->
          <tr>
            <td style="padding: 32px 4px;">
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${t.greeting(greeting)}</h1>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                ${t.message1}
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #555555;">
                ${t.message2}
              </p>
            </td>
          </tr>

          <!-- Features Section -->
          <tr>
            <td style="padding: 0 4px 32px 4px;">
              <p style="margin: 0 0 14px 0; font-family: 'DM Mono', monospace; font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 2px;">${t.nowUnlocked}</p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(29,185,84,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">📊</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature1}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>

                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(139,92,246,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🤖</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature2}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>

                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(236,72,153,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">🎤</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature3}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>

                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #f0f0f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                          <span style="display: inline-block; width: 32px; height: 32px; background: rgba(245,158,11,0.1); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">✨</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${t.feature4}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 4px 32px 4px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border: 2px solid #1DB954; border-radius: 12px;">
                    <a href="https://myscrobble.fm" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #1DB954; text-decoration: none;">
                      ${t.secondaryCta}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 24px 4px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #999999;">
                ${t.footer} <a href="https://lucasbittar.dev" style="color: #888888; text-decoration: none;">Lucas Bittar</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #bbbbbb;">
                © ${new Date().getFullYear()} MyScrobble.fm
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
