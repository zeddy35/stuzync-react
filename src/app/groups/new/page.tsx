export const dynamic = "force-dynamic";

export default function GroupCreatePage() {
  return (
    <section className="page-wrap py-8">
      <div className="section-card max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Create a new group</h1>
        <form action="/api/groups" method="POST" className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Group name</label>
            <input className="input" id="name" name="name" required />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea className="input" id="description" name="description" rows={3} />
          </div>

          <div>
            <label className="label" htmlFor="isPrivate">Privacy</label>
            <select className="input" id="isPrivate" name="isPrivate" defaultValue="false">
              <option value="false">Public</option>
              <option value="true">Private</option>
            </select>
          </div>

          <button className="btn btn-primary w-full" type="submit">Create</button>
        </form>
      </div>
    </section>
  );
}
