import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import PostContent from '@/components/PostContent'
import { AboutMe } from '@/models/AboutMe'
import { AboutMeService } from '@/services/AboutMeService'
import { Container } from '@/components/Container'

async function getAboutMe(): Promise<AboutMe | null> {
  try {
    return await AboutMeService.getAboutMe()
  } catch (error) {
    console.error('Error fetching About Me:', error)
    return null
  }
}

export const metadata = {
  title: 'About Me - Drip Drop Dev',
  description: 'Learn more about the author of Drip Drop Dev',
}

function SocialLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 text-sm text-zinc-800 transition hover:text-drip"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 group-hover:border-drip group-hover:bg-drip/5 transition">
        {icon}
      </div>
      {children}
    </Link>
  )
}

function MailIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

function GitHubIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.475 2 2 6.588 2 12.253c0 4.537 2.862 8.369 6.838 9.727.5.09.687-.218.687-.487 0-.243-.013-1.05-.013-1.91C7 20.059 6.35 18.957 6.15 18.38c-.113-.295-.6-1.205-1.025-1.448-.35-.192-.85-.667-.013-.68.788-.012 1.35.744 1.538 1.051.9 1.551 2.338 1.116 2.912.846.088-.666.35-1.115.638-1.371-2.225-.256-4.55-1.14-4.55-5.062 0-1.115.387-2.038 1.025-2.756-.1-.256-.45-1.307.1-2.717 0 0 .837-.269 2.75 1.051.8-.23 1.65-.346 2.5-.346.85 0 1.7.115 2.5.346 1.912-1.333 2.75-1.05 2.75-1.05.55 1.409.2 2.46.1 2.716.637.718 1.025 1.628 1.025 2.756 0 3.934-2.337 4.806-4.562 5.062.362.32.675.936.675 1.897 0 1.371-.013 2.473-.013 2.82 0 .268.188.589.688.486a10.039 10.039 0 0 0 4.932-3.74A10.447 10.447 0 0 0 22 12.253C22 6.588 17.525 2 12 2Z"
      />
    </svg>
  )
}

function TwitterIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1122 12.8955L4 20H5.38119L10.7254 13.7878L14.994 20H19.656L13.3171 10.7749H13.3174ZM11.4257 12.9738L10.8064 12.0881L5.87886 5.03974H8.00029L11.9769 10.728L12.5962 11.6137L17.7652 19.0075H15.6438L11.4257 12.9742V12.9738Z" />
    </svg>
  )
}

function LinkedInIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 01-1.548-1.549 1.548 1.548 0 111.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z" />
    </svg>
  )
}

export default async function AboutPage() {
  const about = await getAboutMe()

  if (!about) {
    notFound()
  }

  // Check if there are any social links
  const hasSocialLinks = about.twitter || about.github || about.linkedin || about.email

  return (
    <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          {(about.image || hasSocialLinks) && (
            <div className="lg:pl-20">
              {about.image && (
                <div className="max-w-xs px-2.5 lg:max-w-none">
                  <Image
                    src={about.image}
                    alt={about.author}
                    width={400}
                    height={400}
                    className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          )}
          <div className="lg:order-first lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl">
              {about.author}
            </h1>
            <div className="mt-6 space-y-7 text-base text-zinc-600">
              <PostContent content={about.content} />
            </div>
          </div>
          {hasSocialLinks && (
            <div className="lg:pl-20">
              <ul role="list" className="space-y-4">
              {about.twitter && (
                <li>
                  <SocialLink
                    href={about.twitter}
                    icon={<TwitterIcon className="h-4 w-4 fill-current" />}
                  >
                    Follow on Twitter
                  </SocialLink>
                </li>
              )}
              {about.github && (
                <li>
                  <SocialLink
                    href={about.github}
                    icon={<GitHubIcon className="h-4 w-4 fill-current" />}
                  >
                    Follow on GitHub
                  </SocialLink>
                </li>
              )}
              {about.linkedin && (
                <li>
                  <SocialLink
                    href={about.linkedin}
                    icon={<LinkedInIcon className="h-4 w-4 fill-current" />}
                  >
                    Follow on LinkedIn
                  </SocialLink>
                </li>
              )}
              {about.email && (
                <li className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
                  <SocialLink
                    href={`mailto:${about.email}`}
                    icon={<MailIcon className="h-4 w-4 fill-current" />}
                  >
                    {about.email}
                  </SocialLink>
                </li>
              )}
              </ul>
            </div>
          )}
        </div>
    </Container>
  )
}
