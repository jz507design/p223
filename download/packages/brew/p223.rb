# Formula for P223 — Policía de IAs (JZ Design Solutions)
#
# Para usar como tap local:
#   brew tap jz507design/p223   (apunta al repo que contenga esta formula)
#   brew install p223
#
# Homebrew para la versión oficial serviría desde una tarball fuente;
# aquí instalamos el wheel oficial publicado en GitHub Pages dentro de
# un venv y exponemos `p223` como binario.
class P223 < Formula
  desc "P223 - Policía de IAs: auditoría local de entornos de IA (PII, secretos, tráfico)"
  homepage "https://jz507design.github.io/p223/"
  version "0.1.0"
  license "Proprietary"

  depends_on "python@3.11"

  def install
    # Instalar el wheel oficial en un venv dentro del Cellar
    venv = virtualenv_create(libexec, "python3.11")
    wheel_url = "https://jz507design.github.io/p223/download/auditor_ia_local-0.1.0-py3-none-any.whl"
    wheel = cached_download(wheel_url)
    system libexec/"bin/python", "-m", "pip", "install", wheel
    (bin/"p223").write_env_script(libexec/"bin/p223", PYTHONPATH: libexec)
  end

  test do
    system bin/"p223", "--help"
  end
end