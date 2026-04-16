#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    net::TcpStream,
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
    time::{Duration, Instant},
};

use tauri::Manager;

struct ServerProcess(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            let child = start_local_server(&app_handle).map_err(|e| format!("Falha ao iniciar servidor local: {e}"))?;
            wait_for_server("127.0.0.1:5050", Duration::from_secs(15))
                .map_err(|e| format!("Servidor nao respondeu na porta 5050: {e}"))?;

            app.manage(ServerProcess(Mutex::new(Some(child))));
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                if let Some(state) = window.app_handle().try_state::<ServerProcess>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(mut child) = guard.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("erro ao executar app tauri");
}

fn start_local_server(app: &tauri::AppHandle) -> Result<Child, String> {
    let (server_root, public_dir) = resolve_app_paths(app)?;
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;

    let data_dir = app_data_dir.join("data");
    let backup_dir = data_dir.join("backups");
    let vault_dir = app_data_dir.join("KnowledgeOSVault");

    std::fs::create_dir_all(&data_dir).map_err(|e| format!("create data dir: {e}"))?;
    std::fs::create_dir_all(&backup_dir).map_err(|e| format!("create backup dir: {e}"))?;
    std::fs::create_dir_all(&vault_dir).map_err(|e| format!("create vault dir: {e}"))?;

    Command::new("node")
        .arg("server.js")
        .current_dir(&server_root)
        .env("PORT", "5050")
        .env("SMP_APP_HOME", server_root.to_string_lossy().to_string())
        .env("SMP_PUBLIC_DIR", public_dir.to_string_lossy().to_string())
        .env("SMP_DATA_DIR", data_dir.to_string_lossy().to_string())
        .env("SMP_DB_PATH", data_dir.join("app.db").to_string_lossy().to_string())
        .env("SMP_BACKUP_DIR", backup_dir.to_string_lossy().to_string())
        .env("SMP_VAULT_DIR", vault_dir.to_string_lossy().to_string())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("node server.js: {e}"))
}

fn resolve_app_paths(app: &tauri::AppHandle) -> Result<(PathBuf, PathBuf), String> {
    if cfg!(debug_assertions) {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .canonicalize()
            .map_err(|e| format!("resolve dev root: {e}"))?;
        let public = root.join("public");
        return Ok((root, public));
    }

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("resource_dir: {e}"))?;

    let server_root = resource_dir.join("app");
    let public_dir = server_root.join("public");
    Ok((server_root, public_dir))
}

fn wait_for_server(addr: &str, timeout: Duration) -> Result<(), String> {
    let start = Instant::now();
    loop {
        if TcpStream::connect(addr).is_ok() {
            return Ok(());
        }

        if start.elapsed() >= timeout {
            return Err(format!("timeout aguardando {addr}"));
        }
        thread::sleep(Duration::from_millis(250));
    }
}
