export default function ServiceExpired() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center"
    }}>
      <h1>🚫 Service Expired</h1>
      <p>
        Service expired.
        <br />
        Please pay maintenance to continue your service.
      </p>
    </div>
  );
}
