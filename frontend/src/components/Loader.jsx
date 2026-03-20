export default function Loader({ fullPage = false, size = 'md' }) {
  const loader = (
    <div className={`loader-wrap ${size}`}>
      <div className="loader-ring">
        <div className="loader-ring-inner" />
      </div>
      <div className="loader-orb" />
    </div>
  );

  if (fullPage) {
    return <div className="loader-fullpage">{loader}</div>;
  }

  return <div className="loader-center">{loader}</div>;
}
