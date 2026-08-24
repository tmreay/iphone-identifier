// The desktop shell. It has one job: open a window on the static bundle that
// `npm run build` produces.
//
// There are deliberately no Tauri commands here. SPEC.md §5.1 keeps every piece
// of logic in the frontend -- the engine is pure TypeScript so the matrix can be
// tested without a UI, and running in a window changes none of that. The same
// `dist/` is served from a browser and packaged here (SPEC.md D-25), so anything
// that lived in Rust would be a feature the web build did not have.

// Release builds are windowed, so no console flashes up behind the app on Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running the iPhone Identifier window");
}
