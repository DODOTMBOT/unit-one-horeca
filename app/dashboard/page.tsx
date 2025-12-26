import Link from "next/link";

const purchasedFiles = [
  {
    name: "Регламенты ХАССП",
    date: "12.12.2025",
    link: "#download-haccp",
  },
];

const activeProjects = [
  {
    name: "Аудит Food Cost",
    status: "В работе",
    progress: 70,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex items-center justify-between">
          <div className="text-xl font-semibold text-slate-900">Личный кабинет</div>
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <Link
              href="/"
              className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Главная
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800"
            >
              Кабинет
            </Link>
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">Меню</div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <Link
                href="/dashboard"
                className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Обзор
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/dashboard#files"
                className="block rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Мои файлы
              </Link>
              <Link
                href="/dashboard#projects"
                className="block rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Проекты
              </Link>
            </div>
          </aside>

          <main className="space-y-10">
            <section id="files" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Мои файлы</h2>
                <span className="text-xs uppercase tracking-[0.08em] text-slate-500">Скачивания</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Название</th>
                      <th className="px-4 py-3 font-semibold">Дата покупки</th>
                      <th className="px-4 py-3 font-semibold text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {purchasedFiles.map((file) => (
                      <tr key={file.name} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{file.name}</td>
                        <td className="px-4 py-3 text-slate-600">{file.date}</td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={file.link}
                            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            Скачать
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Активные проекты</h2>
                <span className="text-xs uppercase tracking-[0.08em] text-slate-500">В работе</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {activeProjects.map((project) => (
                  <article
                    key={project.name}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm uppercase tracking-[0.08em] text-slate-500">Статус</div>
                        <div className="text-xl font-semibold text-slate-900">{project.name}</div>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Прогресс</span>
                        <span className="font-semibold text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${project.progress}%` }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
