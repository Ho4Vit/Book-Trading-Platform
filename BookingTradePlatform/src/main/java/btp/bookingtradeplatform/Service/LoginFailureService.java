package btp.bookingtradeplatform.Service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
@Transactional
@Service
public class LoginFailureService {

    private final RedisTemplate<String, String> redisTemplate;
    private final Map<String, Integer> captchaFailCount = new ConcurrentHashMap<>();

    private static final int MAX_CAPTCHA_FAILS = 5;
    private static final long BLOCK_DURATION_SECONDS = 30 * 60; // 30 phút

    public LoginFailureService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String getRedisKey(String ip) {
        return "blocked_ip:" + ip;
    }

    public void recordCaptchaFailure(String ip) {
        int count = captchaFailCount.getOrDefault(ip, 0) + 1;
        captchaFailCount.put(ip, count);

        if (count >= MAX_CAPTCHA_FAILS) {
            redisTemplate.opsForValue().set(getRedisKey(ip), "BLOCKED", BLOCK_DURATION_SECONDS, TimeUnit.SECONDS);
        }
    }

    public boolean isBlocked(String ip) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(getRedisKey(ip)));
    }

    public void unblockIp(String ip) {
        redisTemplate.delete(getRedisKey(ip));
        captchaFailCount.remove(ip);
    }

    public void resetCaptchaFailures(String ip) {
        captchaFailCount.remove(ip);
    }

    public int getCaptchaFailCount(String ip) {
        return captchaFailCount.getOrDefault(ip, 0);
    }

    public boolean requireCaptcha(String ip) {
        return getFailCount(ip) >= 3;
    }

    private final Map<String, Integer> failCountByIp = new ConcurrentHashMap<>();

    public void recordFailure(String ip) {
        failCountByIp.put(ip, getFailCount(ip) + 1);
    }

    public void resetFailures(String ip) {
        failCountByIp.remove(ip);
    }

    public int getFailCount(String ip) {
        return failCountByIp.getOrDefault(ip, 0);
    }
}

