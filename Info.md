## Для удаления всех файлов и папок, кроме указанных вами (.env, Dockerfile, Dockerfile.dev, Dockerfile.prod, docker-compose.yml, docker-compose-copy.yml), вы можете использовать следующую команду в терминале:

### Или более безопасный вариант, который сначала покажет, что будет удалено:
```bash
ls -A | grep -v -E "^(\.env|Dockerfile|Dockerfile\.dev|Dockerfile\.prod|docker-compose\.yml|docker-compose-copy\.yml)$"

```

### После проверки вывода, можно выполнить:
```bash
ls -A | grep -v -E "^(\.env|Dockerfile|Dockerfile\.dev|Dockerfile\.prod|docker-compose\.yml|docker-compose-copy\.yml)$" | xargs rm -rf

```

### В Windows (PowerShell):
```bash
Get-ChildItem -Force | Where-Object { $_.Name -notin @('.env', 'Dockerfile', 'Dockerfile.dev', 'Dockerfile.prod', 'docker-compose.yml', 'docker-compose-copy.yml') } | Remove-Item -Recurse -Force

```